
import React from 'react'

function Select({
  id,
  label,
  options = [],
  error,
  register,
  defaultValue = '',
  placeholder = 'Select an option',
  ...rest
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        id={id}
        {...register(id)}
        defaultValue={defaultValue}
        {...rest}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((option) =>
          typeof option === 'string' ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default Select
