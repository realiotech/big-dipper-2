import { Tooltip } from '@chakra-ui/react';
import dayjs from '@src/utils/dayjs';
import { FC, useEffect, useRef, useState } from 'react';
import * as timeago from 'timeago.js';

/* types */
export type TimestampProps = {
    timestamp: Parameters<(typeof dayjs)['utc']>[0] | Parameters<(typeof dayjs)['unix']>[0];
    isUnix?: boolean;
};

const Timestamp: FC<TimestampProps> = ({ timestamp, isUnix }) => {
    const format = 'YYYY-MM-DD HH:mm:ss';

    // eslint-disable-next-line no-nested-ternary
    const timestampDayJs = timestamp
        ? isUnix
            ? dayjs.unix(timestamp as number)
            : dayjs.utc(timestamp)
        : dayjs.utc();
    const [output, setOutput] = useState(() => timestampDayJs?.fromNow());
    const interval = useRef<NodeJS.Timer>();
    useEffect(() => {
        if (timestamp) interval.current = setInterval(() => setOutput(timestampDayJs.fromNow()), 1000);
        return () => {
            if (interval.current) clearInterval(interval.current);
        };
    });

    return (
        <Tooltip>
            {}
        </Tooltip>
    );
};

export default Timestamp;
