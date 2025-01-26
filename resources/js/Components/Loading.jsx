import React from 'react';

const Loading = ({SmallSize}) => {
    return (
        <div className="flex justify-center items-center h-full">
            <div className={`animate-spin rounded-full ${SmallSize ? 'h-8 w-8' : 'h-16 w-16' } border-t-4 border-blue-500 border-solid`}></div>
        </div>
    );
};

export default Loading;
