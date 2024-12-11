import Avatar from '@/components/avatar';
import useStyles from '@/components/avatar_name/styles';
import AddressEllipsis from '@/components/AddressEllipsis';
import { ADDRESS_DETAILS } from '@/utils/go_to_page';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import Link from 'next/link';
import { FC } from 'react';

const Proposer = ({
    address,
    name,
    image,
   ...props
}) => {
    return (
        <Tooltip title={name}>
            <Avatar src={image} alt={name} />
            
        </Tooltip>
    );
};

export default Proposer;
