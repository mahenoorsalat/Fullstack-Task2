import React, { useState, useMemo } from 'react';
import { BlogPost, ReactionType, Comment } from '../types';
import Modal from './Modal';
import { PencilIcon, TrashIcon, HandThumbUpIcon, HeartIcon, HandThumbDownIcon, HandThumbUpIconSolid, HeartIconSolid, HandThumbDownIconSolid } from './icons';

interface BlogPageProps {
  posts: BlogPost[];
  onAddPost: (content: string) => Promise<void>;
  onUpdatePost: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onPostReaction: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onUpdateComment: (postId: string, commentId: string, content: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  currentUserId: string;
  currentUserRole: 'seeker' | 'company' | 'admin';
  currentUserName: string;
  currentUserPhoto: string;
}

interface PostCardProps {
    post: BlogPost;
    currentUserId: string;
    currentUserRole: 'seeker' | 'company' | 'admin';
    currentUserPhoto: string; // For comment form
    onEdit: () => void;
    onDelete: () => void;
    onReaction: (postId: string, reactionType: ReactionType) => void;
    onAddComment: (postId: string, content: string) => Promise<void>;
    onUpdateComment: (postId: string, commentId: string, content: string) => Promise<void>;
    onDeleteCommentClick: (comment: Comment) => void;
    isNew?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, currentUserRole, currentUserPhoto, onEdit, onDelete, onReaction, onAddComment, onUpdateComment, onDeleteCommentClick, isNew }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');

    const reactionCounts = useMemo(() => ({
        like: post.reactions.filter(r => r.type === 'like').length,
        love: post.reactions.filter(r => r.type === 'love').length,
        dislike: post.reactions.filter(r => r.type === 'dislike').length,
    }), [post.reactions]);

    const currentUserReaction = useMemo(() => 
        post.reactions.find(r => r.userId === currentUserId)?.type,
        [post.reactions, currentUserId]
    );

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmittingComment(true);
        await onAddComment(post.id, commentText);
        setCommentText('');
        setIsSubmittingComment(false);
    };

    const handleUpdateCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComment || !editedCommentContent.trim()) return;
        await onUpdateComment(post.id, editingComment.id, editedCommentContent);
        setEditingComment(null);
        setEditedCommentContent('');
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-interactive hover:shadow-interactive-lg hover:-translate-y-1 transition-transform-shadow duration-300 flex flex-col space-y-4 animate-fade-in-up">
            <div className="relative flex space-x-4">
                {isNew && <span className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                <img src={post.authorPhotoUrl} alt={post.authorName} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-baseline space-x-2">
                                <p className="font-bold text-neutral">{post.authorName}</p>
                                <p className="text-sm text-gray-500">· {new Date(post.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                         {currentUserRole === 'admin' && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                                <button onClick={onEdit} className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-100" aria-label="Edit Post">
                                    <PencilIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={onDelete} className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100" aria-label="Delete Post">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 rounded-full bg-gray-100/80 p-1 w-fit">
                    {/* Reaction Buttons */}
                    <button onClick={() => onReaction(post.id, 'like')} className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200 ease-in-out hover:bg-blue-100/60 focus:outline-none focus:ring-2 focus:ring-blue-300 ${currentUserReaction === 'like' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:text-blue-700'}`} aria-pressed={currentUserReaction === 'like'}>
                        {currentUserReaction === 'like' ? <HandThumbUpIconSolid className="h-5 w-5" /> : <HandThumbUpIcon className="h-5 w-5" />}
                        <span>{reactionCounts.like}</span>
                    </button>
                    <button onClick={() => onReaction(post.id, 'love')} className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200 ease-in-out hover:bg-red-100/60 focus:outline-none focus:ring-2 focus:ring-red-300 ${currentUserReaction === 'love' ? 'bg-red-100 text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'}`} aria-pressed={currentUserReaction === 'love'}>
                        {currentUserReaction === 'love' ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
                        <span>{reactionCounts.love}</span>
                    </button>
                    <button onClick={() => onReaction(post.id, 'dislike')} className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200 ease-in-out hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-slate-400 ${currentUserReaction === 'dislike' ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-gray-600 hover:text-slate-800'}`} aria-pressed={currentUserReaction === 'dislike'}>
                        {currentUserReaction === 'dislike' ? <HandThumbDownIconSolid className="h-5 w-5" /> : <HandThumbDownIcon className="h-5 w-5" />}
                        <span>{reactionCounts.dislike}</span>
                    </button>
                </div>
                {post.comments.length > 0 && (
                    <button onClick={() => setShowComments(!showComments)} className="text-sm text-gray-600 hover:underline">
                        {showComments ? 'Hide' : 'View'} {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                    </button>
                )}
            </div>

            {/* Comments Section */}
            {(showComments || post.comments.length === 0) && (
                <div className="pt-4 border-t border-gray-200/80 space-y-4">
                    {post.comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                            <img src={comment.authorPhotoUrl} alt={comment.authorName} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-grow bg-gray-100/80 rounded-lg p-3">
                                {editingComment?.id === comment.id ? (
                                    <form onSubmit={handleUpdateCommentSubmit}>
                                        <textarea
                                            value={editedCommentContent}
                                            onChange={(e) => setEditedCommentContent(e.target.value)}
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white/50"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button type="button" onClick={() => setEditingComment(null)} className="text-sm bg-gray-200 hover:bg-gray-300 text-black font-bold py-1 px-3 rounded-md transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" className="text-sm bg-primary hover:bg-primary-focus text-white font-bold py-1 px-3 rounded-md transition-colors">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-baseline space-x-2">
                                                <p className="font-semibold text-sm text-neutral">{comment.authorName}</p>
                                                <p className="text-xs text-gray-500">· {new Date(comment.timestamp).toLocaleString()}</p>
                                            </div>
                                            {currentUserRole === 'admin' && (
                                                <div className="flex items-center space-x-1">
                                                    <button onClick={() => { setEditingComment(comment); setEditedCommentContent(comment.content); }} className="text-gray-400 hover:text-primary p-1 rounded-full text-xs" aria-label="Edit Comment">
                                                        <PencilIcon className="h-4 w-4"/>
                                                    </button>
                                                    <button onClick={() => onDeleteCommentClick(comment)} className="text-gray-400 hover:text-red-600 p-1 rounded-full text-xs" aria-label="Delete Comment">
                                                        <TrashIcon className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* Add Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="flex space-x-3 items-start pt-2">
                        <img src={currentUserPhoto} alt="Your avatar" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-grow">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white/50"
                                rows={1}
                                disabled={isSubmittingComment}
                            />
                            {commentText && (
                                <div className="text-right mt-2">
                                    <button type="submit" disabled={isSubmittingComment} className="text-sm bg-primary hover:bg-primary-focus text-white font-bold py-1 px-4 rounded-md transition-colors disabled:bg-gray-400">
                                        {isSubmittingComment ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};


const BlogPage: React.FC<BlogPageProps> = ({ posts, onAddPost, onUpdatePost, onDeletePost, onPostReaction, onAddComment, onUpdateComment, onDeleteComment, currentUserId, currentUserRole, currentUserName, currentUserPhoto }) => {
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
    const [deletingCommentInfo, setDeletingCommentInfo] = useState<{ postId: string; comment: Comment } | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsPosting(true);
        try {
            await onAddPost(content);
            setContent('');
        } catch (error) {
            console.error("Failed to post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingPost || !editedContent.trim()) return;
        await onUpdatePost(editingPost.id, editedContent);
        setEditingPost(null);
        setEditedContent('');
    };

    const handleDelete = async () => {
        if (!deletingPost) return;
        await onDeletePost(deletingPost.id);
        setDeletingPost(null);
    };

    const handleDeleteCommentConfirm = async () => {
        if (!deletingCommentInfo) return;
        await onDeleteComment(deletingCommentInfo.postId, deletingCommentInfo.comment.id);
        setDeletingCommentInfo(null);
    };


    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive mb-8">
                    <form onSubmit={handleSubmit} className="flex space-x-4 items-start">
                        <img src={currentUserPhoto} alt={currentUserName} className="h-12 w-12 rounded-full object-cover"/>
                        <div className="flex-grow">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your thoughts about your company, profile, or job life..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white/50"
                                rows={3}
                                disabled={isPosting}
                                aria-label="New post content"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={isPosting || !content.trim()}
                                    className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-6 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isPosting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-neutral">Community Feed</h2>
                    {posts.length > 0 ? (
                        posts.map((post, index) => {
                             // A post is considered "new" if it's the latest one and posted within the last 5 minutes.
                            const isNew = index === 0 && (new Date().getTime() - new Date(post.timestamp).getTime() < 5 * 60 * 1000);
                            return <PostCard 
                                key={post.id} 
                                post={post} 
                                currentUserRole={currentUserRole}
                                currentUserId={currentUserId}
                                currentUserPhoto={currentUserPhoto}
                                onEdit={() => {
                                    setEditingPost(post);
                                    setEditedContent(post.content);
                                }}
                                onDelete={() => setDeletingPost(post)}
                                onReaction={onPostReaction}
                                onAddComment={onAddComment}
                                onUpdateComment={onUpdateComment}
                                onDeleteCommentClick={(comment) => setDeletingCommentInfo({ postId: post.id, comment })}
                                isNew={isNew}
                            />
                        })
                    ) : (
                        <div className="text-center text-gray-500 py-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-interactive">
                            <p>No posts yet.</p>
                            <p>Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Edit Post Modal */}
            <Modal isOpen={!!editingPost} onClose={() => setEditingPost(null)} title="Edit Post">
                <div className="space-y-4">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        rows={6}
                        aria-label="Edit post content"
                    />
                    <div className="flex justify-end space-x-4">
                        <button onClick={() => setEditingPost(null)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-md">Cancel</button>
                        <button onClick={handleUpdate} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md">Save Changes</button>
                    </div>
                </div>
            </Modal>
            
            {/* Delete Post Modal */}
            <Modal isOpen={!!deletingPost} onClose={() => setDeletingPost(null)} title="Confirm Deletion">
                 <div className="text-center">
                    <p className="text-lg">Are you sure you want to delete this post?</p>
                    <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button onClick={() => setDeletingPost(null)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-md">Cancel</button>
                        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">Delete</button>
                    </div>
                </div>
            </Modal>
            
            {/* Delete Comment Modal */}
            <Modal isOpen={!!deletingCommentInfo} onClose={() => setDeletingCommentInfo(null)} title="Confirm Comment Deletion">
                 <div className="text-center">
                    <p className="text-lg">Are you sure you want to delete this comment?</p>
                    <p className="text-sm text-gray-600 mt-2 truncate">"{deletingCommentInfo?.comment.content}"</p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button onClick={() => setDeletingCommentInfo(null)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-md">Cancel</button>
                        <button onClick={handleDeleteCommentConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">Delete</button>
                    </div>
                </div>
            </Modal>

            <style>{`
                @keyframes fade-in-up {
                  0% {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-fade-in-up {
                  animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </main>
    );
}

export default BlogPage;