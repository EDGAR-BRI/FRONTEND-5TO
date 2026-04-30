import Swal, { type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const isDarkMode = (): boolean => {
    if (typeof document === 'undefined') return false;
    return (
        document.documentElement.classList.contains('is-dark') ||
        document.body.classList.contains('is-dark')
    );
};

const getSwalClasses = () => {
    const isDark = isDarkMode();

    return {
        popup: [
            'font-sans',
            'rounded-xl',
            'border',
            'p-6',
            'text-body-m',
            isDark
                ? 'bg-cool-gray-100 text-cool-gray-10 border-cool-gray-80'
                : 'bg-white text-cool-gray-90 border-cool-gray-30',
        ].join(' '),
        title: ['text-heading-6', isDark ? 'text-cool-gray-10' : 'text-cool-gray-90'].join(' '),
        htmlContainer: ['mt-2', 'text-body-s', isDark ? 'text-cool-gray-20' : 'text-cool-gray-70'].join(' '),
        actions: 'mt-6 gap-3',
        confirmButton: [
            'inline-flex',
            'items-center',
            'justify-center',
            'rounded-lg',
            'px-4',
            'py-2.5',
            'text-button-s',
            'bg-primary-600',
            'text-white',
            'hover:bg-primary-500',
            'focus:outline-none',
            'focus-visible:outline',
            'focus-visible:outline-2',
            'focus-visible:outline-offset-2',
            'focus-visible:outline-primary-600',
            'transition-colors',
        ].join(' '),
        cancelButton: [
            'inline-flex',
            'items-center',
            'justify-center',
            'rounded-lg',
            'px-4',
            'py-2.5',
            'text-button-s',
            isDark ? 'bg-cool-gray-80 text-cool-gray-10 hover:bg-cool-gray-70' : 'bg-cool-gray-20 text-cool-gray-90 hover:bg-cool-gray-30',
            'focus:outline-none',
            'focus-visible:outline',
            'focus-visible:outline-2',
            'focus-visible:outline-offset-2',
            'focus-visible:outline-primary-600',
            'transition-colors',
        ].join(' '),
    } as const;
};

const fire = (options: SweetAlertOptions) => {
    const customClass = getSwalClasses();
    return Swal.fire({
        buttonsStyling: false,
        heightAuto: false,
        customClass,
        ...options,
    });
};

export const Alert = {
    success: async (title: string, text?: string, timer = 2000): Promise<SweetAlertResult> => {
        return fire({
            title,
            text,
            icon: "success",
            timer,
            showConfirmButton: false,
        });
    },

    error: async (title: string, text?: string): Promise<SweetAlertResult> => {
        return fire({
            title,
            text,
            icon: "error",
            confirmButtonText: "Entendido",
        });
    },

    confirm: async (
        title: string,
        text: string,
        confirmButtonText = "Sí, continuar",
        cancelButtonText = "Cancelar"
    ): Promise<boolean> => {
        const result = await fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
        });
        return result.isConfirmed;
    },

    info: async (title: string, text?: string): Promise<SweetAlertResult> => {
        return fire({
            title,
            text,
            icon: "info",
            confirmButtonText: "Ok",
        });
    }
};
