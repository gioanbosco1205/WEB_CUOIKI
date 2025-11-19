"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const isInsidePopupRef = useRef(false);

  const filters = useAppSelector((state) => state.global.filters);
  const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/thanhduong1/cmgqqw45x00d701sd7rx1cmab",
      center:
        filters.longitude && filters.latitude
          ? [filters.longitude, filters.latitude]
          : [106.6519, 10.9804],
      zoom: 13,
    });

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      const markerEl = marker.getElement();
      const popup = marker.getPopup();
      if (!popup) return;

      const lngLat = [property.location.longitude, property.location.latitude] as [number, number];

      /** 🟩 Hover vào marker → mở popup */
      markerEl.addEventListener("mouseenter", () => {
        // Đóng popup cũ nếu có
        if (currentPopupRef.current && currentPopupRef.current !== popup) {
          currentPopupRef.current.remove();
        }

        popup.setLngLat(lngLat).addTo(map);
        currentPopupRef.current = popup;

        const popupEl = popup.getElement();
        if (!popupEl) return;

        /** 🟩 Khi hover vào popup */
        popupEl.onmouseenter = () => {
          isInsidePopupRef.current = true;
        };

        /** 🟥 Khi rời popup */
        popupEl.onmouseleave = () => {
          isInsidePopupRef.current = false;
          popup.remove();
          if (currentPopupRef.current === popup) currentPopupRef.current = null;
        };
      });

      /** 🟥 Khi rời marker → tắt popup nếu KHÔNG nằm trong popup */
      markerEl.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (!isInsidePopupRef.current) {
            popup.remove();
            if (currentPopupRef.current === popup) currentPopupRef.current = null;
          }
        }, 70);
      });

      /** Đổi màu marker SVG */
      const path = markerEl.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
    });

    setTimeout(() => map.resize(), 700);
    return () => map.remove();
  }, [isLoading, isError, properties, filters.longitude, filters.latitude]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="map-container rounded-xl"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

/**
 * Popup + Marker
 */
const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const imageUrl = property.photoUrls?.[0] || "/placeholder.jpg";

  const popupHtml = `
    <div class="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
      <div class="flex">
        <img 
          src="${imageUrl}" 
          alt="${property.name}" 
          class="w-24 h-24 object-cover rounded-l-xl"
          onerror="this.src='/placeholder.jpg'"
        />
        <div class="p-2 flex flex-col justify-between">
          <a 
            href="/search/${property.id}" 
            target="_blank"
            class="block text-sm font-semibold text-gray-800 hover:text-blue-600 leading-snug line-clamp-2"
          >
            ${property.name}
          </a>
          <div class="flex items-center mt-1 text-yellow-400 text-sm">
            ★ <span class="ml-1 text-gray-700 font-semibold text-xs">${property.averageRating?.toFixed(1) || "8.5"}</span>
          </div>
          <p class="text-gray-900 font-bold text-sm mt-1">
            ${property.pricePerMonth.toLocaleString()} 
            <span class="text-gray-500 font-normal text-xs">VNĐ / Tháng</span>
          </p>
        </div>
      </div>
    </div>
  `;

  const popup = new mapboxgl.Popup({
    offset: 20,
    closeButton: false,
    className: "custom-popup",
  }).setHTML(popupHtml);

  return new mapboxgl.Marker({ color: "#000000" })
    .setLngLat([property.location.longitude, property.location.latitude])
    .setPopup(popup)
    .addTo(map);
};

export default Map;
