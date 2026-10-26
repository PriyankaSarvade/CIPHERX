import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon = null
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#3478C9] hover:bg-[#2866AE] text-white border-transparent shadow-xs';
      case 'secondary':
        return 'bg-white hover:bg-[#F2F7FC] text-[#243447] border-[#D7E4F0] hover:border-[#B9D7F2] shadow-2xs';
      case 'outline':
        return 'bg-transparent hover:bg-[#EAF4FC] text-[#3478C9] border-[#3478C9]';
      case 'danger':
        return 'bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300';
      case 'danger-filled':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-xs';
      case 'ghost':
        return 'bg-transparent hover:bg-[#F2F7FC] text-[#64748B] hover:text-[#243447] border-transparent';
      default:
        return 'bg-[#3478C9] hover:bg-[#2866AE] text-white border-transparent';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs rounded-md gap-1.5';
      case 'lg':
        return 'px-4 py-2.5 text-base rounded-md gap-2.5';
      case 'md':
      default:
        return 'px-3.5 py-2 text-sm rounded-md gap-2';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium border transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
};
