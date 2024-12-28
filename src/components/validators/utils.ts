export const fetchColumns = (
    t: any
): {
    key: string;
    align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
    sortKey?: string;
    sort?: boolean;
}[] => [
        {
            key: 'idx',
            align: 'left'
        },
        {
            key: 'validator',
            sortKey: 'validator.name',
            sort: true,
            align: 'left'
        },
        {
            key: 'votingPower',
            sortKey: 'votingPower',
            sort: true,
            align: 'left'
        },
        {
            key: 'commission',
            sortKey: 'commission',
            align: 'right',
            sort: true,
        },
        {
            key: 'status',
            align: 'left'
        },
    ];
