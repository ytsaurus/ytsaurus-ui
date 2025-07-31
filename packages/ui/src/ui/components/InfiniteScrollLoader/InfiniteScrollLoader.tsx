import React, {FC, useEffect, useRef} from 'react';
import {Flex, Loader} from '@gravity-ui/uikit';

type Props = {
    className?: string;
    loading?: boolean;
    onLoadMore: () => void;
};

export const InfiniteScrollLoader: FC<Props> = ({className, loading, onLoadMore}) => {
    const paginationRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onLoadMore();
                    }
                });
            },
            {
                root: null,
                threshold: 0.1,
            },
        );

        if (paginationRef.current) {
            observer.observe(paginationRef.current);
        }

        return () => {
            if (paginationRef.current) {
                observer.unobserve(paginationRef.current);
            }
        };
    }, []);

    return (
        <Flex className={className} ref={paginationRef} alignItems="center" justifyContent="center">
            {loading ? <Loader /> : ''}
        </Flex>
    );
};
