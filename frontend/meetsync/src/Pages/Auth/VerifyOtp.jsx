import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { verifyOtp, resendOtp } from '../../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const {  handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { otp: '' },
  });

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [counter, setCounter] = useState(300); // OTP expiration timer (5 minutes)
  const [resendTimer, setResendTimer] = useState(60); // Resend cooldown (1 minute)
  const inputRefs = useRef([]);

  // OTP expiration timer
  useEffect(() => {
    if (counter <= 0) return;
    const otpTimer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(otpTimer);
  }, [counter]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const resendCooldown = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(resendCooldown);
  }, [resendTimer]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInputChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only single digit or empty

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Update form value for react-hook-form
    const otp = newOtpDigits.join('');
    setValue('otp', otp, { shouldValidate: true });

    // Move focus to next input if digit entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length <= 6) {
      const newOtpDigits = ['', '', '', '', '', ''];
      pastedData.split('').forEach((digit, i) => {
        newOtpDigits[i] = digit;
      });
      setOtpDigits(newOtpDigits);
      setValue('otp', newOtpDigits.join(''), { shouldValidate: true });

      // Focus the last filled input or the first empty one
      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  const onSubmit = async (data) => {
    const result = await dispatch(verifyOtp({ email, otp: data.otp }));
    if (verifyOtp.fulfilled.match(result)) {
      toast.success('User registered successfully');
      navigate('/login');
    } else {
      toast.error(result.payload?.message || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const result = await dispatch(resendOtp({ email }));
    if (resendOtp.fulfilled.match(result)) {
      toast.success('OTP resent successfully');
      setCounter(300);
      setResendTimer(60);
    } else {
      toast.error(result.payload?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">OTP Verification</h2>
        <p className="text-sm text-gray-600 text-center mb-2">
          Enter the OTP sent to <span className="font-semibold">{email}</span>
        </p>
        <p className="text-xs text-red-500 text-center mb-6">OTP expires in: {formatTime(counter)}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 space-y-6">
          <div>
            <Label htmlFor="otp-0" className="text-gray-700 font-semibold">OTP</Label>
            <div className="flex justify-between gap-2 mt-2" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 text-center text-lg border-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="-"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-sm mt-2">{errors.otp.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-200"
          >
            Verify OTP
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            className={`text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
          >
            Resend OTP {resendTimer > 0 && `in ${resendTimer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;