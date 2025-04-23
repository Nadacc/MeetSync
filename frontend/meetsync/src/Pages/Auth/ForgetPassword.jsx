import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../features/authSlice";
import Label from '../../components/ui/Label'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useState,useEffect } from "react";
import toast from "react-hot-toast";

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const[alertData,setAlertData] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });



  useEffect(() => {
    console.log("Alert Data updated:", alertData);
  }, [alertData]);
  


  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.get("/users/check-email", {
        params: { email: data.email },
      });
      console.log("API Response:", response.data);
      const { exists, isGoogleUser } = response.data;
  
      if (!exists) {
        toast.error("Email not found");
        return;
      }
      if (isGoogleUser) {
        toast.error("This email is registered via Google. Password reset not allowed.");
        return;
      }
      console.log("Alert Data:", alertData);

  
      dispatch(forgotPassword(data.email))
        .unwrap()
        .then(() => {
          toast.success("OTP sent to your email");
          navigate("/reset-password", { state: { email: data.email } });
        })
        .catch((err) => {
          console.error("Error sending OTP:", err);
        });
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {alertData && (
        <div className="mb-4" style={{ zIndex: 9999, backgroundColor: 'red' }}>
          <AlertBox
            {...alertData}
            onClose={() => setAlertData(null)}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-center">Forgot Password</h2>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full cursor-pointer text-white">
          Send OTP
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
