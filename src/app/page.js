'use client'

import { useState, useEffect, useRef } from 'react'

// Toast Component
const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 2000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'delete':
        return 'bg-red-500 text-white'
      case 'update':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div
      className={`
        ${getToastStyles()}
        px-4 py-3 rounded-lg shadow-lg mb-2
        transform transition-all duration-300 ease-out
        translate-x-full opacity-0
        animate-slide-in
      `}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{toast.message}</span>
      </div>
    </div>
  )
}

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

const dummyBookmarks = [
  {
    id: 1,
    title: 'GitHub',
    url: 'https://github.com',
    category: 'Dev'
  },
  {
    id: 2,
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'AI'
  },
  {
    id: 3,
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'Learning'
  },
  {
    id: 4,
    title: 'Vercel',
    url: 'https://vercel.com',
    category: 'Tools'
  },
  {
    id: 5,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    category: 'Dev'
  },
  {
    id: 6,
    title: 'Figma',
    url: 'https://figma.com',
    category: 'Tools'
  }
]

const categories = ['All', 'AI', 'Dev', 'Learning', 'Tools']
const bookmarkCategories = ['AI', 'Dev', 'Learning', 'Tools']

// Load bookmarks from localStorage or use dummy data as default
const loadBookmarksFromStorage = () => {
  if (typeof window === 'undefined') return dummyBookmarks
  
  try {
    const stored = localStorage.getItem('smart-bookmarks')
    return stored ? JSON.parse(stored) : dummyBookmarks
  } catch (error) {
    console.error('Error loading bookmarks from localStorage:', error)
    return dummyBookmarks
  }
}

// Save bookmarks to localStorage
const saveBookmarksToStorage = (bookmarks) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('smart-bookmarks', JSON.stringify(bookmarks))
  } catch (error) {
    console.error('Error saving bookmarks to localStorage:', error)
  }
}

// Get favicon URL from bookmark URL
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch (error) {
    return '/default-favicon.png'
  }
}

// Get favicon emoji based on category (deprecated, keeping for reference)
const getFaviconForCategory = (category) => {
  const favicons = {
    'AI': '🤖',
    'Dev': '💻',
    'Learning': '📚',
    'Tools': '🔧'
  }
  return favicons[category] || '🔗'
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [bookmarks, setBookmarks] = useState(dummyBookmarks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'AI'
  })
  const [formErrors, setFormErrors] = useState({})
  const [toasts, setToasts] = useState([])
  const titleInputRef = useRef(null)

  // Toast management
  const addToast = (message, type = 'success') => {
    const newToast = {
      id: Date.now(),
      message,
      type
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const loadedBookmarks = loadBookmarksFromStorage()
    setBookmarks(loadedBookmarks)
  }, [])

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    saveBookmarksToStorage(bookmarks)
  }, [bookmarks])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc)
      // Focus first input when modal opens
      setTimeout(() => titleInputRef.current?.focus(), 100)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isModalOpen])

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id) => {
    setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== id))
    addToast('Bookmark deleted', 'delete')
  }

  // Add bookmark function for future use
  const addBookmark = (newBookmark) => {
    const bookmarkWithId = {
      ...newBookmark,
      id: Date.now() // Simple unique ID using timestamp
    }
    setBookmarks(prevBookmarks => [...prevBookmarks, bookmarkWithId])
    addToast('Bookmark added successfully', 'success')
  }

  // Update bookmark function
  const updateBookmark = (id, updatedData) => {
    setBookmarks(prevBookmarks => 
      prevBookmarks.map(bookmark => 
        bookmark.id === id 
          ? { ...bookmark, ...updatedData }
          : bookmark
      )
    )
    addToast('Bookmark updated', 'update')
  }

  // Handle edit button click
  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      category: bookmark.category
    })
    setIsModalOpen(true)
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!formData.url.trim()) {
      errors.url = 'URL is required'
    } else if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      errors.url = 'URL must start with http:// or https://'
    }
    
    if (!formData.category) {
      errors.category = 'Category is required'
    }
    
    return errors
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()
    
    if (Object.keys(errors).length === 0) {
      if (editingBookmark) {
        // Edit mode - update existing bookmark
        updateBookmark(editingBookmark.id, formData)
      } else {
        // Add mode - create new bookmark
        addBookmark(formData)
      }
      setIsModalOpen(false)
      setEditingBookmark(null)
      setFormData({ title: '', url: '', category: 'AI' })
      setFormErrors({})
    } else {
      setFormErrors(errors)
    }
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Reset form when modal closes
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBookmark(null)
    setFormData({ title: '', url: '', category: 'AI' })
    setFormErrors({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Smart Bookmark</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Bookmark
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Search bookmarks…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookmark Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredBookmarks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No bookmarks yet — start by adding one 🚀
            </h2>
            <p className="text-gray-500">
              Your bookmark collection will appear here once you add some bookmarks.
            </p>
          </div>
        ) : (
          /* Bookmark Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] p-6 relative group"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(bookmark)}
                  className="absolute top-4 right-12 text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Favicon and Title */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={getFaviconUrl(bookmark.url)}
                    alt={bookmark.title}
                    className="w-6 h-6 rounded flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "/default-favicon.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{bookmark.title}</h3>
                  </div>
                </div>

                {/* URL */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate block mb-3 transition-colors"
                >
                  {bookmark.url}
                </a>

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {bookmark.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-200 scale-100 opacity-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Title Field */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter bookmark title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* URL Field */}
              <div className="mb-4">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {formErrors.url && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.url}</p>
                )}
              </div>

              {/* Category Field */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {bookmarkCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingBookmark ? 'Update Bookmark' : 'Save Bookmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
