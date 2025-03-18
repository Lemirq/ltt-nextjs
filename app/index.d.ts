export interface Trip {
  trip_id: string;
  start_time: string;
  start_date: string;
  schedule_relationship: number;
  route_id: string;
  direction_id: number;
}

export interface Position {
  latitude: number;
  longitude: number;
  bearing: number;
  odometer: number;
  speed: number;
}

export interface VehicleDetails {
  id: string;
  label: string;
  license_plate: string;
}

export interface Vehicle {
  trip: Trip;
  position: Position;
  current_stop_sequence: number;
  current_status: number;
  timestamp: number;
  congestion_level: number;
  stop_id: string;
  vehicle: VehicleDetails;
  occupancy_status: number;
  occupancy_percentage: number;
  multi_carriage_details: any[];
}

export interface Entity {
  id: string;
  is_deleted: boolean;
  trip_update: any;
  vehicle: Vehicle;
  alert: any;
  shape: any;
  trip: any;
  route: any;
  stop: any;
}
