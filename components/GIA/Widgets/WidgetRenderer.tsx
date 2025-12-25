import React from 'react';
import { View } from 'react-native';
import { ConditionCard } from './ConditionCard';
import { TrainerCarousel } from './TrainerCarousel';
import { InvoiceDraftWidget } from './InvoiceDraftWidget';
import { LeadListWidget } from './LeadListWidget';
import { CampaignDraftWidget } from './CampaignDraftWidget';

interface WidgetRendererProps {
    type: string;
    data?: any;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, data }) => {
    switch (type) {
        case 'conditions':
            return <ConditionCard />;
        case 'trainers':
            return <TrainerCarousel />;
        case 'invoice':
            return <InvoiceDraftWidget />;
        case 'leads':
            return <LeadListWidget />;
        case 'campaign':
            return <CampaignDraftWidget />;
        default:
            return null;
    }
};
