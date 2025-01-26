import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', ...defaultTheme.fontFamily.sans],
                almarai: ['Almarai', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'primaryColor': {
                    DEFAULT: '#FEC200',
                },
                'SecondaryColor': {
                    DEFAULT: '#ffc60d',
                },
                'DarkBG1': {
                    DEFAULT: '#18181B',
                },
                'DarkBG2': {
                    DEFAULT: '#09090B',
                },
                'DarkBG3': {
                    DEFAULT: '#242427',
                },
                'TextDark': {
                    DEFAULT: '#000000',
                },
                'LightBG1': {
                    DEFAULT: '#FFFFFF',
                },
                'LightBG2': {
                    DEFAULT: '#FAFAFA',
                },
                'LightBG3': {
                    DEFAULT: '#F4F4F5',
                },
                'TextLight': {
                    DEFAULT: '#FFFFFF',
                },
                'IconColor': {
                    DEFAULT: '#AFAFB7',
                },
            },
            borderColor: {
                DEFAULT: '#D97706',
            },
            safelist: [
                'bg-green-500',
                'bg-red-500',
                'bg-yellow-500',
            ],
        },
    },

    plugins: [forms],
};
