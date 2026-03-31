import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to send reset link
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-pink-600 p-3 rounded-2xl text-white mb-4 shadow-xl shadow-pink-200">
            <ShoppingBasket size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">KART ADMIN</h1>
          <p className="text-gray-500 mt-2 font-medium">Reset your password to regain access.</p>
        </div>

        <Card className="shadow-2xl shadow-pink-100 border-none p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Forgot Password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-[38px] text-gray-400" size={18} />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@kart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 text-lg shadow-lg shadow-pink-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </form>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Check your email</h2>
                <p className="text-gray-500 mt-2">
                  We've sent a password reset link to <br />
                  <span className="font-bold text-gray-800">{email}</span>
                </p>
              </div>
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full py-4">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>
        
        <p className="text-center mt-8 text-gray-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 My Wearables ADMIN PANEL
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
