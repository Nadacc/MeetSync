import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Label from "../components/ui/Label";
import SearchableSelect from "../components/ui/SearchableSelect";
import { timezones } from "../utils/timezones";
import { updateUserProfile } from "../features/authSlice";
import { FaUser, FaEdit } from "react-icons/fa";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  timezone: yup.string().required("Timezone is required"),
  profilePic: yup.mixed().test('fileSize', 'File is too large', (value) => {
    if (value && value[0]) {
      return value[0].size <= 5000000; // 5MB limit
    }
    return true;
  }),
});

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState(user?.profilePic || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    resolver: yupResolver(schema),
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedProfilePic(URL.createObjectURL(file));
      setValue("profilePic", file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("timezone", data.timezone);

    if (data.profilePic) {
      formData.append("profilePic", data.profilePic);
    }

    dispatch(updateUserProfile(formData));
    setIsEditing(false); // Exit edit mode after submission
  };

  const timezoneOptions = timezones.map((tz) => ({
    label: tz,
    value: tz,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Edit Profile" : "My Profile"}
        </h2>

        {!isEditing ? (
          // Profile View Mode
          <div className="bg-white p-6">
            <div className="flex flex-col items-center mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl text-gray-500" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.timezone}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 p-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                aria-label="Edit Profile"
              >
                <FaEdit className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Profile Edit Mode
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 space-y-6">
            <div className="flex justify-center mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {selectedProfilePic ? (
                  <img
                    src={selectedProfilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl text-gray-500" />
                )}
              </div>
              <label
                htmlFor="profilePic"
                className="absolute -bottom-2 bg-gray-600 text-white p-2 rounded-full cursor-pointer"
              >
                <FaEdit />
              </label>
            </div>

            <input
              type="file"
              id="profilePic"
              accept="image/*"
              {...register("profilePic")}
              className="hidden"
              onChange={handleFileChange}
            />

            <div>
              <Label className="text-gray-700 font-semibold">Name</Label>
              <Input
                {...register("name")}
                className="mt-2 w-full border-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-700 font-semibold">Timezone</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    id="timezone"
                    options={timezoneOptions}
                    value={timezoneOptions.find((option) => option.value === field.value)}
                    onChange={(selectedOption) => field.onChange(selectedOption.value)}
                    onBlur={field.onBlur}
                    className="mt-2 w-full bg-gray-50 text-gray-800"
                    error={errors.timezone?.message}
                  />
                )}
              />
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-500">{errors.timezone.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-200"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;