// components/ui/Textarea.js
const Textarea = ({ value, onChange, placeholder, ...rest }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded"
      {...rest}
    />
  );
};

export default Textarea;
