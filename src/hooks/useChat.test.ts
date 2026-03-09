import { toolLabel, completedLabel, extractCards } from "./useChat";

describe("toolLabel", () => {
  it.each([
    ["search_resy_restaurants", "Searching restaurants…"],
    ["search_resy_by_cuisine", "Browsing by cuisine…"],
    ["check_resy_availability", "Checking availability…"],
    ["make_resy_reservation", "Booking reservation…"],
    ["resolve_reservation_conflict", "Resolving conflict…"],
    ["view_my_reservations", "Loading reservations…"],
    ["view_sniper_jobs", "Loading sniper jobs…"],
    ["schedule_sniper", "Scheduling sniper…"],
    ["get_current_time", "Checking time…"],
  ])("returns '%s' → '%s'", (tool, expected) => {
    expect(toolLabel(tool)).toBe(expected);
  });

  it("returns 'Working…' for unknown tool", () => {
    expect(toolLabel("unknown_tool")).toBe("Working…");
  });
});

describe("completedLabel", () => {
  it.each([
    ["search_resy_restaurants", "Searched restaurants"],
    ["search_resy_by_cuisine", "Browsed by cuisine"],
    ["check_resy_availability", "Checked availability"],
    ["make_resy_reservation", "Booked reservation"],
    ["resolve_reservation_conflict", "Resolved conflict"],
    ["view_my_reservations", "Loaded reservations"],
    ["view_sniper_jobs", "Loaded sniper jobs"],
    ["schedule_sniper", "Scheduled sniper"],
    ["get_current_time", "Checked time"],
  ])("returns '%s' → '%s'", (tool, expected) => {
    expect(completedLabel(tool)).toBe(expected);
  });

  it("returns 'Done' for unknown tool", () => {
    expect(completedLabel("unknown_tool")).toBe("Done");
  });
});

describe("extractCards", () => {
  describe("check_resy_availability", () => {
    it("returns AvailabilityCardData on success", () => {
      const result = {
        success: true,
        date: "2026-03-10",
        party_size: 2,
        available_times: [
          { time: "7:00 PM", table_type: "Indoor", config_id: "cfg-1" },
          { time: "8:30 PM", table_type: "Outdoor", config_id: "cfg-2" },
        ],
      };
      const cards = extractCards("check_resy_availability", result);
      expect(cards).toHaveLength(1);
      expect(cards[0]).toEqual({
        kind: "availability",
        date: "2026-03-10",
        partySize: 2,
        slots: [
          { time: "7:00 PM", type: "Indoor", configId: "cfg-1" },
          { time: "8:30 PM", type: "Outdoor", configId: "cfg-2" },
        ],
      });
    });

    it("returns empty array on failure", () => {
      const result = { success: false, error: "No availability" };
      expect(extractCards("check_resy_availability", result)).toEqual([]);
    });
  });

  describe("make_resy_reservation", () => {
    it("returns ReservationCardData with Confirmed status when reservation_id present", () => {
      const result = {
        success: true,
        venue_slug: "lartusi",
        date: "2026-03-10",
        time_slot: "7:00 PM",
        party_size: 4,
        reservation_id: "RES-12345",
      };
      const cards = extractCards("make_resy_reservation", result);
      expect(cards).toHaveLength(1);
      expect(cards[0]).toEqual({
        kind: "reservation",
        venue: "lartusi",
        date: "2026-03-10",
        time: "7:00 PM",
        partySize: 4,
        confirmationNumber: "RES-12345",
        status: "Confirmed",
      });
    });

    it("returns Pending status when no reservation_id", () => {
      const result = {
        success: true,
        venue_slug: "lartusi",
        date: "2026-03-10",
        time_slot: "7:00 PM",
        party_size: 2,
      };
      const cards = extractCards("make_resy_reservation", result);
      expect(cards[0]!.kind).toBe("reservation");
      if (cards[0]!.kind === "reservation") {
        expect(cards[0]!.status).toBe("Pending");
        expect(cards[0]!.confirmationNumber).toBeUndefined();
      }
    });
  });

  describe("view_sniper_jobs", () => {
    it("returns SniperJobCardData for each job", () => {
      const result = {
        success: true,
        jobs: [
          {
            job_id: 1,
            restaurant: "Carbone",
            date: "2026-03-15",
            preferred_times: "7-8 PM",
            status: "pending",
            poll_count: 3,
            max_attempts: 20,
          },
          {
            job_id: 2,
            restaurant: "Don Angie",
            date: "2026-03-16",
            preferred_times: "6-7 PM",
            status: "completed",
            poll_count: 10,
            max_attempts: 20,
          },
        ],
      };
      const cards = extractCards("view_sniper_jobs", result);
      expect(cards).toHaveLength(2);
      expect(cards[0]).toEqual({
        kind: "sniper",
        jobId: 1,
        restaurant: "Carbone",
        date: "2026-03-15",
        preferredTimes: "7-8 PM",
        status: "pending",
        pollCount: 3,
        maxAttempts: 20,
      });
    });
  });

  it("returns empty array for unknown tool", () => {
    expect(extractCards("unknown_tool", { success: true })).toEqual([]);
  });

  it("returns empty array when success is false", () => {
    expect(
      extractCards("check_resy_availability", { success: false }),
    ).toEqual([]);
  });
});
