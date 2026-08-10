const selectedSeatIds = new Set<string>();

const listeners: Array<() => void> = [];

export function getSelectedSeatIds() {
  return selectedSeatIds;
}

export function toggleSeat(seatId: string) {
  if (selectedSeatIds.has(seatId)) {
    selectedSeatIds.delete(seatId);
  } else {
    selectedSeatIds.add(seatId);
  }

  listeners.forEach((listener) => listener());
}

export function removeSelectedSeat(seatId: string) {
  selectedSeatIds.delete(seatId);

  listeners.forEach((listener) => listener());
}

export function clearSelectedSeats() {
  selectedSeatIds.clear();

  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}
