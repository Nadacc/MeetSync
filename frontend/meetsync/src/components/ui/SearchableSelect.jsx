import React from 'react'
import Select from 'react-select'

function SearchableSelect({
  id,
  label,
  options = [],
  error,
  onChange,
  onBlur, // ✅ add onBlur prop
  value,
  placeholder = 'Select an option...',
  isDisabled = false,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Select
        inputId={id}
        options={options}
        placeholder={placeholder}
        value={value}
        onChange={(val) => {
          onChange(val)
          onBlur() // ✅ manually call onBlur to set touched
        }}
        isDisabled={isDisabled}
        classNames={{
          control: () => 'border border-gray-300 rounded-md text-sm',
        }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default SearchableSelect
