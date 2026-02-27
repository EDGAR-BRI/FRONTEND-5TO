import React from 'react';

interface CheckBoxProps {
    label: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    variant?: 'checkbox' | 'switch';
}

export const CheckBox: React.FC<CheckBoxProps> = ({ label, checked, onChange, name, variant = 'checkbox' }) => {

    if (variant === 'switch') {
        return (
            <label className="inline-flex items-center cursor-pointer gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        className="sr-only peer"
                        type="checkbox"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                    />
                    <div className="peer rounded-full outline-none duration-100 after:duration-500 w-20 h-10 bg-primary-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-60 after:content-['No'] after:absolute after:outline-none after:rounded-full after:h-8 after:w-8 after:bg-white after:top-1 after:left-1 after:flex after:justify-center after:items-center after:text-cool-gray-50 after:font-bold peer-checked:bg-primary-60 peer-checked:after:translate-x-10 peer-checked:after:content-['Sí'] peer-checked:after:border-white peer-checked:after:text-black">
                    </div>
                </label>
                <span className="text-body-s font-medium text-primary">{label}</span>
            </label>
        );
    }

    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-primary-300 text-primary-60 checked:bg-primary-60 accent-primary-60 bg-transparent focus:ring-primary-60"
            />
            <span className="text-body-s text-primary-700">{label}</span>
        </label>
    );
};
