import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "http://gtfs.ltconline.ca/Vehicle/VehiclePositions.json",
      {
        next: { revalidate: 0 }, // No cache
      },
    );

    console.log("Fetching bus data...");

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("Bus data fetched successfully");
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bus data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
