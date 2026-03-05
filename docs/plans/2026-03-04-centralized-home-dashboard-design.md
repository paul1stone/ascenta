# Centralized Home Dashboard — Design

**Date:** 2026-03-04

## Summary

Add a "Home" page as the root entry point of the platform app, accessible via a persistent sidebar link above all categories.

## Routing

- New route: `app/home/page.tsx` — standalone page, no function tabs
- `app/page.tsx` redirects to `/home` (replaces current redirect to `/launch/onboarding`)

## Sidebar

- "Home" link at the top of `NavSidebar`, above the category nav loop
- Icon: `LayoutDashboard` (lucide-react)
- Active state: `pathname === "/home"` or `pathname.startsWith("/home")`
- No sub-pages — single link, no expand/collapse behavior
- Visual separator (spacing or divider) between Home and the category list

## Home Page (Framework Only)

- Heading: "Home" with subtitle "Your centralized HR dashboard"
- Empty placeholder content area
- No function tabs, no breadcrumbs — standalone layout

## Out of Scope

- Existing `/dashboard` page remains untouched
- `DASHBOARD_NAV` array unchanged (Home is not a NavCategory)
- All `[category]/[sub]` routing unchanged
