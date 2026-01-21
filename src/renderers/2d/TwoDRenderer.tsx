import { useRef, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectRendererParams } from "@/features/configurator/state/selectors";
import type { CabinetType, CabinetSize } from "@/features/configurator/model/types";

// Room dimensions in pixels (representing room size)
// Room is 5 meters long = 500px, 3 meters wide = 300px (scale: 1m = 100px)
const ROOM_WIDTH = 500;
const ROOM_HEIGHT = 300;
const SNAP_THRESHOLD = 10; // Distance in pixels for snapping

export function TwoDRenderer() {
  const dispatch = useAppDispatch();
  const params = useAppSelector(selectRendererParams);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
  const [roomBounds, setRoomBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [selectedCabinetId, setSelectedCabinetId] = useState<string | null>(null);

  useEffect(() => {
    const updateRoomBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      // Center the room rectangle
      const roomLeft = (containerWidth - ROOM_WIDTH) / 2;
      const roomTop = (containerHeight - ROOM_HEIGHT) / 2;
      const roomRight = roomLeft + ROOM_WIDTH;
      const roomBottom = roomTop + ROOM_HEIGHT;

      setRoomBounds({ left: roomLeft, top: roomTop, right: roomRight, bottom: roomBottom });
    };

    updateRoomBounds();
    window.addEventListener("resize", updateRoomBounds);
    return () => window.removeEventListener("resize", updateRoomBounds);
  }, []);

  const getCabinetDimensions = (width: number, depth: number, rotation: number) => {
    // When rotated 90 or 270 degrees, swap width and depth
    if (rotation === 90 || rotation === 270) {
      return { width: depth, depth: width };
    }
    return { width, depth };
  };

  const isPointInRoom = (
    x: number,
    y: number,
    cabinetWidth: number,
    cabinetDepth: number,
    rotation: number = 0
  ): boolean => {
    const dims = getCabinetDimensions(cabinetWidth, cabinetDepth, rotation);
    const cabinetLeft = x;
    const cabinetTop = y;
    const cabinetRight = x + dims.width;
    const cabinetBottom = y + dims.depth;

    return (
      cabinetLeft >= roomBounds.left &&
      cabinetTop >= roomBounds.top &&
      cabinetRight <= roomBounds.right &&
      cabinetBottom <= roomBounds.bottom
    );
  };

  const snapPosition = (
    x: number,
    y: number,
    cabinetWidth: number,
    cabinetDepth: number,
    excludeCabinetId?: string,
    rotation: number = 0
  ): { x: number; y: number } => {
    const dims = getCabinetDimensions(cabinetWidth, cabinetDepth, rotation);
    let snappedX = x;
    let snappedY = y;
    let minDistanceX = Infinity;
    let minDistanceY = Infinity;

    // Snap to walls (left, right, top, bottom)
    const wallLeft = roomBounds.left;
    const wallRight = roomBounds.right - dims.width;
    const wallTop = roomBounds.top;
    const wallBottom = roomBounds.bottom - dims.depth;

    const distToLeftWall = Math.abs(x - wallLeft);
    const distToRightWall = Math.abs(x - wallRight);
    const distToTopWall = Math.abs(y - wallTop);
    const distToBottomWall = Math.abs(y - wallBottom);

    if (distToLeftWall < SNAP_THRESHOLD && distToLeftWall < minDistanceX) {
      snappedX = wallLeft;
      minDistanceX = distToLeftWall;
    }
    if (distToRightWall < SNAP_THRESHOLD && distToRightWall < minDistanceX) {
      snappedX = wallRight;
      minDistanceX = distToRightWall;
    }

    if (distToTopWall < SNAP_THRESHOLD && distToTopWall < minDistanceY) {
      snappedY = wallTop;
      minDistanceY = distToTopWall;
    }
    if (distToBottomWall < SNAP_THRESHOLD && distToBottomWall < minDistanceY) {
      snappedY = wallBottom;
      minDistanceY = distToBottomWall;
    }

    // Snap to other cabinets
    for (const cabinet of params.placedCabinets) {
      if (cabinet.id === excludeCabinetId) continue;

      const otherWidth = getCabinetWidth(cabinet.size);
      const otherDepth = getCabinetDepth(cabinet.type);
      const otherLeft = cabinet.x;
      const otherRight = cabinet.x + otherWidth;
      const otherTop = cabinet.y;
      const otherBottom = cabinet.y + otherDepth;

      // Horizontal snapping: align left edges, right edges, or place adjacent
      const alignLeftLeft = Math.abs(x - otherLeft);
      const alignRightRight = Math.abs(x + dims.width - otherRight);
      const placeRight = Math.abs(x - otherRight);
      const placeLeft = Math.abs(x + dims.width - otherLeft);

      if (alignLeftLeft < SNAP_THRESHOLD && alignLeftLeft < minDistanceX) {
        snappedX = otherLeft;
        minDistanceX = alignLeftLeft;
      }
      if (alignRightRight < SNAP_THRESHOLD && alignRightRight < minDistanceX) {
        snappedX = otherRight - dims.width;
        minDistanceX = alignRightRight;
      }
      if (placeRight < SNAP_THRESHOLD && placeRight < minDistanceX) {
        snappedX = otherRight;
        minDistanceX = placeRight;
      }
      if (placeLeft < SNAP_THRESHOLD && placeLeft < minDistanceX) {
        snappedX = otherLeft - dims.width;
        minDistanceX = placeLeft;
      }

      // Vertical snapping: align top edges, bottom edges, or place adjacent
      const alignTopTop = Math.abs(y - otherTop);
      const alignBottomBottom = Math.abs(y + dims.depth - otherBottom);
      const placeBelow = Math.abs(y - otherBottom);
      const placeAbove = Math.abs(y + dims.depth - otherTop);

      if (alignTopTop < SNAP_THRESHOLD && alignTopTop < minDistanceY) {
        snappedY = otherTop;
        minDistanceY = alignTopTop;
      }
      if (alignBottomBottom < SNAP_THRESHOLD && alignBottomBottom < minDistanceY) {
        snappedY = otherBottom - dims.depth;
        minDistanceY = alignBottomBottom;
      }
      if (placeBelow < SNAP_THRESHOLD && placeBelow < minDistanceY) {
        snappedY = otherBottom;
        minDistanceY = placeBelow;
      }
      if (placeAbove < SNAP_THRESHOLD && placeAbove < minDistanceY) {
        snappedY = otherTop - dims.depth;
        minDistanceY = placeAbove;
      }
    }

    // Ensure snapped position is within room bounds
    snappedX = Math.max(roomBounds.left, Math.min(snappedX, roomBounds.right - dims.width));
    snappedY = Math.max(roomBounds.top, Math.min(snappedY, roomBounds.bottom - dims.depth));

    return { x: snappedX, y: snappedY };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      
      // Check if it's a cabinet being moved (has cabinetId)
      if (data.cabinetId) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cabinet = params.placedCabinets.find((c) => c.id === data.cabinetId);
        if (cabinet) {
          const cabinetWidth = getCabinetWidth(cabinet.size);
          const cabinetDepth = getCabinetDepth(cabinet.type);
          const initialX = Math.max(roomBounds.left, Math.min(x - cabinetWidth / 2, roomBounds.right - cabinetWidth));
          const initialY = Math.max(roomBounds.top, Math.min(y - cabinetDepth / 2, roomBounds.bottom - cabinetDepth));

          // Apply snapping
          const snapped = snapPosition(initialX, initialY, cabinetWidth, cabinetDepth, data.cabinetId, cabinet.rotation);

          // Check if cabinet is within room boundaries
          if (isPointInRoom(snapped.x, snapped.y, cabinetWidth, cabinetDepth, cabinet.rotation)) {
            dispatch.moveCabinet(data.cabinetId, snapped.x, snapped.y);
          } else {
            // If dropped outside room, remove it
            dispatch.removeCabinet(data.cabinetId);
          }
        }
        return;
      }

      // Otherwise it's a new cabinet from OptionsPanel
      const newCabinetData = data as {
        type: CabinetType;
        size: CabinetSize;
      };

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cabinetWidth = newCabinetData.size === "40" ? 40 : 60;
      const cabinetDepth = newCabinetData.type === "top" ? 30 : 50;
      const initialX = Math.max(roomBounds.left, Math.min(x - cabinetWidth / 2, roomBounds.right - cabinetWidth));
      const initialY = Math.max(roomBounds.top, Math.min(y - cabinetDepth / 2, roomBounds.bottom - cabinetDepth));

      // Apply snapping
      const snapped = snapPosition(initialX, initialY, cabinetWidth, cabinetDepth);

      // Only add cabinet if it's within room boundaries
      if (isPointInRoom(snapped.x, snapped.y, cabinetWidth, cabinetDepth, 0)) {
        dispatch.addCabinet({
          type: newCabinetData.type,
          size: newCabinetData.size,
          x: snapped.x,
          y: snapped.y
        });
      }
    } catch (error) {
      console.error("Failed to parse drag data", error);
    }
  };

  const handleCabinetDragStart = (cabinetId: string, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ cabinetId }));
  };

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOverTrash(true);
  };

  const handleTrashDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverTrash(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain")) as {
        cabinetId: string;
      };
      if (data.cabinetId) {
        dispatch.removeCabinet(data.cabinetId);
      }
    } catch (error) {
      console.error("Failed to parse drag data", error);
    }
  };


  const getCabinetWidth = (size: CabinetSize) => {
    return size === "40" ? 40 : 60;
  };

  const getCabinetDepth = (type: CabinetType) => {
    return type === "top" ? 30 : 50; // Top cabinets: 30cm, bottom cabinets: 50cm
  };

  const getCabinetColor = (type: CabinetType) => {
    return type === "top" ? "#94A3B8" : "#64748B";
  };

  const handleCabinetClick = (cabinetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCabinetId === cabinetId) {
      setSelectedCabinetId(null);
    } else {
      setSelectedCabinetId(cabinetId);
    }
  };

  const handleRotateClick = (cabinetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cabinet = params.placedCabinets.find((c) => c.id === cabinetId);
    if (!cabinet) return;

    // Rotate by 90 degrees
    const newRotation = (cabinet.rotation + 90) % 360;
    dispatch.rotateCabinet(cabinetId, newRotation);
  };

  const handleContainerClick = () => {
    setSelectedCabinetId(null);
  };

  return (
    <div
      ref={containerRef}
      className="configurator-2d-viewport relative h-full w-full overflow-hidden rounded-xl"
      style={{ backgroundColor: "#f9f0dc" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleContainerClick}
    >
      {/* Room boundary rectangle */}
      <div
        className="configurator-room-boundary absolute rounded-lg border-2 border-dashed border-slate-400 bg-slate-50/50 shadow-sm"
        style={{
          left: `${roomBounds.left}px`,
          top: `${roomBounds.top}px`,
          width: `${ROOM_WIDTH}px`,
          height: `${ROOM_HEIGHT}px`
        }}
      />

      {params.placedCabinets.map((cabinet) => {
        const cabinetWidth = getCabinetWidth(cabinet.size);
        const cabinetDepth = getCabinetDepth(cabinet.type);
        const isSelected = selectedCabinetId === cabinet.id;
        // Top cabinets should always be above bottom cabinets
        const zIndex = cabinet.type === "top" ? 10 : 5;

        return (
          <div key={cabinet.id} className="configurator-cabinet-wrapper absolute" style={{ zIndex }}>
            <div
              className={`configurator-cabinet-square absolute cursor-move rounded border-2 shadow-md transition-shadow ${
                isSelected
                  ? "border-amber-600 shadow-lg"
                  : "border-slate-400 hover:border-slate-600 hover:shadow-lg"
              }`}
              style={{
                left: `${cabinet.x}px`,
                top: `${cabinet.y}px`,
                width: `${cabinetWidth}px`,
                height: `${cabinetDepth}px`,
                backgroundColor: getCabinetColor(cabinet.type),
                transform: `rotate(${cabinet.rotation}deg)`,
                transformOrigin: "center center"
              }}
              draggable
              onDragStart={(e) => handleCabinetDragStart(cabinet.id, e)}
              onClick={(e) => handleCabinetClick(cabinet.id, e)}
            >
              <div className="configurator-cabinet-label flex h-full items-center justify-center text-xs font-medium text-white">
                {cabinet.size}
              </div>
            </div>
            {isSelected && (
              <div
                className="configurator-rotate-handle absolute cursor-pointer"
                style={{
                  left: `${cabinet.x + cabinetWidth / 2}px`,
                  top: `${cabinet.y - 30}px`,
                  transform: `translateX(-50%)`
                }}
                onClick={(e) => handleRotateClick(cabinet.id, e)}
              >
                <svg
                  className="h-6 w-6 text-amber-700 hover:text-amber-800 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
      {params.placedCabinets.length > 0 && (
        <div
          className={`configurator-trash-icon absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
            isDraggingOverTrash
              ? "border-red-500 bg-red-100"
              : "border-slate-300 bg-white"
          }`}
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
        >
          <svg
            className={`h-6 w-6 transition-colors ${
              isDraggingOverTrash ? "text-red-600" : "text-slate-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      )}
      {params.placedCabinets.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-medium text-slate-700">Přetáhněte skříňky sem</div>
            <div className="text-xs text-slate-500">Drag and drop cabinets here</div>
          </div>
        </div>
      )}
    </div>
  );
}



