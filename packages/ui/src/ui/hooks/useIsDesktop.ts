import {useEffect, useState} from 'react';
export const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.matchMedia('(min-width: 1280px)').matches);
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isDesktop;
};
