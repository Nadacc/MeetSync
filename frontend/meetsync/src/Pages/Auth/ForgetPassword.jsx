import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../features/authSlice";
import Label from '../../components/ui/Label'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    dispatch(forgotPassword(data.email))
      .unwrap()
      .then(() => {
        navigate("/reset-password", { state: { email: data.email } });
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
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
        <Button type="submit" className="w-full">
          Send OTP
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
