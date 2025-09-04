import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface MessageRatingProps {
  messageId: string
  initialRating?: number
  onRate: (rating: number, feedback?: string) => void
  disabled?: boolean
  showFeedback?: boolean
}

export function MessageRating({ 
  messageId, 
  initialRating = 0, 
  onRate, 
  disabled = false,
  showFeedback = true 
}: MessageRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showFeedbackBox, setShowFeedbackBox] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [hasRated, setHasRated] = useState(initialRating > 0)

  const handleRatingClick = (newRating: number) => {
    if (disabled) return
    
    setRating(newRating)
    setHasRated(true)
    
    if (newRating <= 2 && showFeedback) {
      setShowFeedbackBox(true)
    } else {
      onRate(newRating)
    }
  }

  const handleFeedbackSubmit = () => {
    onRate(rating, feedback)
    setShowFeedbackBox(false)
    setFeedback('')
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Poor'
      case 2: return 'Poor' 
      case 3: return 'Average'
      case 4: return 'Good'
      case 5: return 'Excellent'
      default: return 'Rate this response'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-500'
    if (rating === 3) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getQuickFeedbackSuggestions = (rating: number) => {
    if (rating <= 2) {
      return [
        'Irrelevant answer',
        'Incorrect information',
        'Too vague',
        'Missed the point',
        'Confusing explanation'
      ]
    }
    return []
  }

  return (
    <div className="mt-2">
      {/* Star Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => !disabled && setHoveredRating(star)}
              onMouseLeave={() => !disabled && setHoveredRating(0)}
              disabled={disabled}
              className={`transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              title={getRatingText(star)}
            >
              <Star
                className={`h-4 w-4 ${
                  star <= (hoveredRating || rating)
                    ? `fill-current ${getRatingColor(hoveredRating || rating)}`
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Text */}
        {(rating > 0 || hoveredRating > 0) && (
          <span className={`text-xs font-medium ${getRatingColor(hoveredRating || rating)}`}>
            {getRatingText(hoveredRating || rating)}
          </span>
        )}

        {/* Success Indicator */}
        {hasRated && !showFeedbackBox && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Thanks for rating!</span>
          </div>
        )}
      </div>

      {/* Quick Actions for Poor Ratings */}
      {rating <= 2 && rating > 0 && !showFeedbackBox && showFeedback && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowFeedbackBox(true)}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded"
          >
            <AlertTriangle className="h-3 w-3" />
            Help AI improve
          </button>
          <span className="text-xs text-gray-500">What went wrong?</span>
        </div>
      )}

      {/* Feedback Box */}
      {showFeedbackBox && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Help the AI learn from this mistake
            </span>
          </div>
          
          <p className="text-xs text-red-700 mb-3">
            Your feedback helps the AI avoid similar problems in future conversations.
          </p>

          {/* Quick Feedback Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {getQuickFeedbackSuggestions(rating).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setFeedback(feedback ? `${feedback}, ${suggestion}` : suggestion)}
                className="text-xs bg-white border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Custom Feedback */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what went wrong or how this could be improved..."
            className="w-full p-2 text-sm border border-red-200 rounded resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setShowFeedbackBox(false)
                setFeedback('')
                onRate(rating)
              }}
              className="text-xs text-gray-600 hover:text-gray-700 px-3 py-1"
            >
              Skip
            </button>
            <button
              onClick={handleFeedbackSubmit}
              className="text-xs bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Learning Indicator */}
      {rating >= 4 && hasRated && (
        <div className="flex items-center gap-1 mt-2 text-green-600">
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs">Great! This response will help train the AI.</span>
        </div>
      )}
    </div>
  )
}

export default MessageRating
