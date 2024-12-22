
'use client'
import React from 'react';
import numeral from 'numeral';
import useTranslation from 'next-translate/useTranslation';
import {
    RadialBarChart,
    PolarAngleAxis,
    RadialBar,
    Tooltip,
} from 'recharts';
import {
    useProfileRecoil,
} from '@/recoil/profiles';
import { useConsensus } from './hooks';
import { Box, GridItem, Text } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';

const Consensus = () => {
    const { state } = useConsensus();
    const { t } = useTranslation('home');
    const data = [
        {
            value: state.roundCompletion,
        },
    ];

    const circleSize = 200;
    const proposerProfile = useProfileRecoil(state.proposer);

    return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
            <Text>
                {t('consensus')}
            </Text>
            <Box>
                <Box>
                    <Text>
                        {t('height')}
                    </Text>
                    <Text>
                        {t('proposer')}
                    </Text>
                </Box>
                <Box>
                    <Text>
                        {numeral(state.height).format('0,0')}
                    </Text>
                    {state?.proposer ? (
                        <Avatar name="Proposer" src={proposerProfile?.imageUrl} />
                    ) : (
                        '-'
                    )}
                </Box>
            </Box>
            <Box>
                <RadialBarChart
                    width={circleSize}
                    height={circleSize}
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    innerRadius={90}
                    outerRadius={90}
                    barSize={10}
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={circleSize / 2}
                    />
                    <Tooltip />
                    <text
                        x={circleSize / 2}
                        y={circleSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="progress-label"
                    >
                        <tspan>
                            {t('step', {
                                step: numeral(state.step).format('0,0'),
                            })}
                        </tspan>
                    </text>
                    <text
                        x={(circleSize / 2) - 32}
                        y={(circleSize / 2) + 35}
                    >
                        <tspan>
                            {t('round', {
                                round: numeral(state.round).format('0,0'),
                            })}
                        </tspan>
                    </text>
                </RadialBarChart>
            </Box>
        </GridItem>
    );
};

export default Consensus;
