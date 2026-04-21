'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CommentsSectionProps {
  roomId: string
}

export default function CommentsSection({ roomId }: CommentsSectionProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [userReactions, setUserReactions] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchComments()
    if (user) {
      fetchUserReactions()
    }

    // Real-time subscription
    const channel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, user])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    setComments(data || [])
  }

  const fetchUserReactions = async () => {
    if (!user) return

    const { data } = await supabase
      .from('comment_reactions')
      .select('comment_id, reaction')
      .eq('user_id', user.id)

    if (data) {
      const reactions: Record<string, string> = {}
      data.forEach((r) => {
        reactions[r.comment_id] = r.reaction
      })
      setUserReactions(reactions)
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please login to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please write something')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            user_id: user.id,
            room_id: roomId,
            content: newComment.trim(),
          },
        ])

      if (error) throw error

      setNewComment('')
      toast.success('Comment posted!')
      fetchComments()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Please login to react')
      return
    }

    try {
      const currentReaction = userReactions[commentId]

      if (currentReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId)

        // Update count
        const field = reactionType === 'like' ? 'likes' : 'dislikes'
        const comment = comments.find((c) => c.id === commentId)
        if (comment) {
          await supabase
            .from('comments')
            .update({ [field]: Math.max(0, comment[field] - 1) })
            .eq('id', commentId)
        }

        const newReactions = { ...userReactions }
        delete newReactions[commentId]
        setUserReactions(newReactions)
      } else {
        // If switching reaction
        if (currentReaction) {
          // Remove old reaction count
          const oldField = currentReaction === 'like' ? 'likes' : 'dislikes'
          const comment = comments.find((c) => c.id === commentId)
          if (comment) {
            await supabase
              .from('comments')
              .update({ [oldField]: Math.max(0, comment[oldField] - 1) })
              .eq('id', commentId)
          }
        }

        // Upsert reaction
        await supabase
          .from('comment_reactions')
          .upsert({
            user_id: user.id,
            comment_id: commentId,
            reaction: reactionType,
          })

        // Update new count
        const newField = reactionType === 'like' ? 'likes' : 'dislikes'
        const comment = comments.find((c) => c.id === commentId)
        if (comment) {
          const currentCount = currentReaction
            ? comment[newField]
            : comment[newField]
          await supabase
            .from('comments')
            .update({ [newField]: currentCount + 1 })
            .eq('id', commentId)
        }

        setUserReactions({ ...userReactions, [commentId]: reactionType })
      }

      fetchComments()
    } catch (error: any) {
      toast.error('Failed to react')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      toast.success('Comment deleted!')
      fetchComments()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editText.trim() })
        .eq('id', commentId)

      if (error) throw error

      setEditingId(null)
      setEditText('')
      toast.success('Comment updated!')
      fetchComments()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const startEdit = (comment: any) => {
    setEditingId(comment.id)
    setEditText(comment.content)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Input */}
      {user ? (
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-ocean rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={loading || !newComment.trim()}
                  className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean-dark disabled:opacity-50 transition"
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            Please{' '}
            <a href="/login" className="text-ocean hover:underline font-semibold">
              login
            </a>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-700 font-bold">
                  {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              <div className="flex-grow">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>

                  {/* Edit/Delete for own comments */}
                  {user && user.id === comment.user_id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-gray-400 hover:text-blue-500 transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Content or Edit Mode */}
                {editingId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ocean resize-none"
                      rows={2}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-4 py-1 bg-ocean text-white rounded-lg text-sm hover:bg-ocean-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                )}

                {/* Like / Dislike */}
                <div className="flex items-center space-x-4 mt-3">
                  {/* Like Button */}
                  <button
                    onClick={() => handleReaction(comment.id, 'like')}
                    className={`flex items-center space-x-1 transition ${
                      userReactions[comment.id] === 'like'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={userReactions[comment.id] === 'like' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-sm font-medium">{comment.likes || 0}</span>
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={() => handleReaction(comment.id, 'dislike')}
                    className={`flex items-center space-x-1 transition ${
                      userReactions[comment.id] === 'dislike'
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={userReactions[comment.id] === 'dislike' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span className="text-sm font-medium">{comment.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}