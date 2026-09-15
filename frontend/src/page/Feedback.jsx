import { Send, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { feedbackAPI } from '../services/api';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    mealType: 'general',
    rating: 0,
    comment: '',
    responses: {}
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const questions = [
    {
      id: 'overall_experience',
      type: 'paragraph',
      question: 'How would you rate your overall experience with the mess services? Please provide detailed feedback.',
      placeholder: 'Share your thoughts about the overall mess experience...'
    },
    {
      id: 'food_quality',
      type: 'paragraph',
      question: 'What improvements would you suggest for the food quality and variety?',
      placeholder: 'Suggest improvements for food quality and variety...'
    },
    {
      id: 'food_on_time',
      type: 'truefalse',
      question: 'The food is served on time according to the scheduled menu.'
    },
    {
      id: 'best_meal',
      type: 'objective',
      question: 'Which meal do you find most satisfactory?',
      options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
    },
    {
      id: 'cleanliness',
      type: 'truefalse',
      question: 'The dining area is clean and well-maintained.'
    },
    {
      id: 'staff_service',
      type: 'paragraph',
      question: 'How can the mess staff improve their service and hospitality?',
      placeholder: 'Share suggestions about staff service and hospitality...'
    },
    {
      id: 'dietary_preferences',
      type: 'paragraph',
      question: 'Are there any dietary restrictions or special preferences we should consider?',
      placeholder: 'Mention any dietary restrictions or preferences...'
    },
    {
      id: 'billing_transparent',
      type: 'truefalse',
      question: 'The billing and payment process is transparent and hassle-free.'
    },
    {
      id: 'new_items',
      type: 'paragraph',
      question: 'What new food items or cuisines would you like to see in the menu?',
      placeholder: 'Suggest new food items or cuisines...'
    },
    {
      id: 'hygiene_safety',
      type: 'paragraph',
      question: 'How satisfied are you with the hygiene and food safety standards?',
      placeholder: 'Share your feedback on hygiene and food safety...'
    },
    {
      id: 'would_recommend',
      type: 'truefalse',
      question: 'You would recommend this mess to other students.'
    },
    {
      id: 'issue_frequency',
      type: 'objective',
      question: 'How often do you face issues with the mess services?',
      options: ['Rarely', 'Sometimes', 'Frequently', 'Very Frequently']
    }
  ];

  const handleResponseChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await feedbackAPI.submit({
        mealType: formData.mealType,
        rating: formData.rating,
        comment: formData.comment,
        responses: formData.responses
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          mealType: 'general',
          rating: 0,
          comment: '',
          responses: {}
        });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-500 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">Weekly Feedback Form</h1>
          <p className="text-blue-100 mt-2">Help us improve your mess experience by sharing your valuable feedback</p>
          <p className="text-blue-200 text-sm mt-1">🔒 Your feedback is completely anonymous</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-900 font-medium">Thank you! Your anonymous feedback has been submitted successfully.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Quick Rating Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Rating</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
              <select
                value={formData.mealType}
                onChange={e => setFormData({ ...formData, mealType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="general">General</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Star Rating</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= formData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Comment</label>
            <textarea
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share a quick comment about the food..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Instructions:</span> Please answer the detailed questions below honestly. Your feedback is anonymous and will help us provide better services.
          </p>
        </div>

        {/* Feedback Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>

                <div className="flex-grow">
                  <label className="text-gray-900 font-medium text-base mb-4 block">
                    {question.question}
                  </label>

                  {/* Paragraph Questions */}
                  {question.type === 'paragraph' && (
                    <textarea
                      value={formData.responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                  )}

                  {/* True/False Questions */}
                  {question.type === 'truefalse' && (
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value="true"
                          checked={formData.responses[question.id] === 'true'}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          className="w-4 h-4 accent-blue-700"
                        />
                        <span className="text-gray-700 font-medium">True</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value="false"
                          checked={formData.responses[question.id] === 'false'}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          className="w-4 h-4 accent-blue-700"
                        />
                        <span className="text-gray-700 font-medium">False</span>
                      </label>
                    </div>
                  )}

                  {/* Objective Questions */}
                  {question.type === 'objective' && (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={formData.responses[question.id] === option}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="w-4 h-4 accent-blue-700"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-700 to-blue-800 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-shadow ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            Submit Feedback
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Your feedback is valuable and helps us maintain high standards of service. All responses are anonymous.
          </p>
        </div>
      </div>
    </div>
  );
}