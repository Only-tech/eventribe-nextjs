import React from 'react';

type HomeButtonProps = {
    onClick?: () => void;
    title?: string;
    className?: string;
};

const HomeButton: React.FC<HomeButtonProps> = ({ onClick, title = "Page d'accueil", className }) => {
    const Tag = onClick ? 'button' : 'span';

    const props = {
        onClick,
        className: `${onClick ? 'cursor-pointer' : ''} ${className || ''}`,
        title,
    };

    const animatedClass =
        "relative inline-flex rounded-full p-3 transition-colors duration-300 ease-in-out hover:bg-black/15 group overflow-hidden place-content-center before:content-[''] before:absolute before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#0088aa] before:left-[calc(50%-3px)] before:-bottom-4 before:transition-all before:duration-300 before:ease-in-out hover:before:bottom-2 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-in-out hover:[&>svg]:-translate-y-1.5";

    return (
        <Tag {...props}>
            <span className={onClick ? animatedClass : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-6">
                    <path
                        fill="#ff952a"
                        d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
                    />
                    <path
                        fill="#0088aa"
                        className="group-hover:[fill:currentColor] transition-all ease-in-out duration-600"
                        d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
                    />
                </svg>
            </span>
        </Tag>
    );
};

export default HomeButton;