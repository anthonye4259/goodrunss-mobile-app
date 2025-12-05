// Example: How to use Maps Service for venue directions

import { MapsService } from '@/lib/services/maps-service';
import { Venue } from '@/lib/venue-data';

// Example 1: Open directions to a venue
async function openVenueDirections(venue: Venue) {
    const mapsService = MapsService.getInstance();

    const location = {
        latitude: venue.lat || venue.coordinates?.lat || 0,
        longitude: venue.lng || venue.coordinates?.lon || 0,
        name: venue.name,
        address: venue.address,
    };

    await mapsService.openDirections(location);
}

// Example 2: Just view venue location (no directions)
async function viewVenueOnMap(venue: Venue) {
    const mapsService = MapsService.getInstance();

    const location = {
        latitude: venue.lat || venue.coordinates?.lat || 0,
        longitude: venue.lng || venue.coordinates?.lon || 0,
        name: venue.name,
    };

    await mapsService.openLocation(location);
}

// Example 3: Calculate distance from user to venue
function getDistanceToVenue(
    userLat: number,
    userLon: number,
    venue: Venue
): string {
    const mapsService = MapsService.getInstance();

    const venueLat = venue.lat || venue.coordinates?.lat || 0;
    const venueLon = venue.lng || venue.coordinates?.lon || 0;

    const distance = mapsService.calculateDistance(
        userLat,
        userLon,
        venueLat,
        venueLon
    );

    return mapsService.formatDistance(distance);
}

// Example 4: Get shareable directions URL
function getShareableDirectionsUrl(venue: Venue): string {
    const mapsService = MapsService.getInstance();

    const location = {
        latitude: venue.lat || venue.coordinates?.lat || 0,
        longitude: venue.lng || venue.coordinates?.lon || 0,
        name: venue.name,
    };

    return mapsService.getDirectionsUrl(location);
}

// Example 5: Use in a component
/*
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

function VenueCard({ venue }: { venue: Venue }) {
  const handleGetDirections = async () => {
    await openVenueDirections(venue);
  };

  return (
    <Card>
      <Text>{venue.name}</Text>
      <Text>{venue.address}</Text>
      
      <Button 
        onPress={handleGetDirections}
        icon={<Ionicons name="navigate" size={20} color="black" />}
      >
        Get Directions
      </Button>
    </Card>
  );
}
*/

export {
    openVenueDirections,
    viewVenueOnMap,
    getDistanceToVenue,
    getShareableDirectionsUrl,
};
