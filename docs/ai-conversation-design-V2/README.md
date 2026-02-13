# AI Conversation Design v2 – Travel Planner
project:
  title: "AI Conversation Design – Travel Planner (V2)"
  description: >
    This repository contains 30 redesigned conversations for an AI-based
    travel planning web application. Version 2 reflects system upgrades
    including calendar-based date selection, seasonal reasoning, and
    Google Maps–optimized itinerary generation.

structure:
  directory: "/conversations"
  format: "YAML-style individual conversation files"
  conversation_components:
    - Scenario
    - User Input:
        - Destination
        - Start Date
        - End Date
        - Group Type
        - Budget Level
        - Interests
    - AI Output:
        - Season Identification
        - Daily Clustered Itinerary
        - Transportation Guidance
        - Seasonal Highlights
    - Observation / Reflection

system_upgrade:
  version_transition: "V1 → V2"
  enhancements:
    calendar_based_date_selection:
      description: >
        Users select specific start and end dates.
        The system calculates trip duration automatically
        and performs temporal reasoning.
    seasonal_awareness:
      description: >
        The AI infers seasonality from travel dates and integrates
        seasonal attractions, weather considerations, festivals,
        limited-time events, and peak travel adjustments.
      examples:
        - Cherry blossom season planning
        - Summer heat schedule adjustment
        - Autumn foliage routing
        - Winter indoor clustering
        - Holiday congestion handling
    google_maps_integration:
      description: >
        Itinerary generation now includes geographic clustering,
        route optimization, and transportation suggestions aligned
        with Google Maps compatibility.
      capabilities:
        - District-based attraction grouping
        - Minimizing backtracking
        - Transit-aware recommendations
        - Map-search-friendly location outputs

purpose:
  objective: >
    To explore how structured user inputs influence AI-generated
    travel itineraries within realistic web application constraints.
  focus_areas:
    - Temporal reasoning
    - Context-aware adaptation
    - Geographic optimization
    - User-centered refinement

author:
  name: "Zonghao Liu"
edits.
