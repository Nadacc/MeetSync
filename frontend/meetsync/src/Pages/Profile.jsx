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
import { FaUser, FaEdit } from "react-icons/fa"; // Importing icons

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  timezone: yup.string().required("Timezone is required"),
  profilePic: yup.mixed().test('fileSize', 'File is too large', (value) => {
    if (value && value[0]) {
      return value[0].size <= 5000000; // 5MB
    }
    return true;
  }),
});

function Profile() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [selectedProfilePic, setSelectedProfilePic] = useState(user?.profilePic || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue, // For dynamically setting the file value
    } = useForm({
        defaultValues: {
            name: user?.name || "",
            timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        resolver: yupResolver(schema),
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the first file from the FileList
        console.log("File selected:", file); // Log the file to ensure it's captured
    
        if (file) {
            setSelectedProfilePic(URL.createObjectURL(file)); // For preview, if needed
            setValue("profilePic", file); // Set the single file instead of FileList
        }
    };
    
    const onSubmit = (data) => {
        console.log(data);  // Log all form data
    
        // Now access the file as a single file
        const profilePicFile = data.profilePic;
        console.log("File selected:", profilePicFile);  // Ensure the file is selected
    
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("timezone", data.timezone);
    
        // Only append the profilePic if a file is selected
        if (profilePicFile) {
            formData.append("profilePic", profilePicFile); // Append the single file
        }
    
        console.log("FormData before dispatch:", formData);
    
        if (formData.has("profilePic")) {
            dispatch(updateUserProfile(formData));
        } else {
            console.error("No profile picture selected.");
        }
    };
    

    const timezoneOptions = timezones.map((tz) => ({
        label: tz,
        value: tz,
    }));

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];  // Get the first file from the FileList
    //     console.log("File selected:", file);  // Log the file to ensure it's captured
    
    //     if (file) {
    //         setSelectedProfilePic(URL.createObjectURL(file));  // For preview, if needed
    //         setValue("profilePic", event.target.files);  // Set the file input in react-hook-form
    //     }
    // };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Profile Picture Circle */}
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

                    {/* Edit Icon OUTSIDE the circle */}
                    <label
                        htmlFor="profilePic"
                        className="absolute -bottom-2  bg-gray-600 text-white p-2 rounded-full cursor-pointer shadow"
                    >
                        <FaEdit />
                    </label>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    id="profilePic"
                    accept="image/*"
                    {...register("profilePic")}  // Registering with react-hook-form
                    className="hidden"
                    onChange={handleFileChange}  // Keep the file change handler
                />

                <div>
                    <Label>Name</Label>
                    <Input {...register("name")} />
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Timezone</Label>
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
                                error={errors.timezone?.message}
                            />
                        )}
                    />
                    {errors.timezone && (
                        <p className="text-sm text-red-500">{errors.timezone.message}</p>
                    )}
                </div>

                <Button type="submit">Save Changes</Button>
            </form>
        </div>
    );
}

export default Profile;
