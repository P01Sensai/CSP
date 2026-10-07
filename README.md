# Cold Storage ERP System

A modern, offline-first Enterprise Resource Planning (ERP) system designed specifically for Cold Storage facilities. 

This repository contains the complete suite of applications required to run the operation, featuring a dual-frontend architecture designed to support a Maker-Checker workflow.

## Project Structure

This is a monorepo containing three distinct applications:

- **`/cold-storage-desktop`**: The Munim (Worker) PC Application. Built with Tauri, React, and IndexedDB. It operates completely **offline-first**, syncing data in the background whenever an internet connection is available.
- **`/cold-storage-web`**: The Owner Web Portal. A cloud-hosted dashboard built with React and Vite, allowing the owner to monitor live operations and approve/reject slips remotely.
- **`/cold-storage-backend`**: The Cloud Sync Engine. A robust API built with NestJS, Prisma, and PostgreSQL (Supabase) that synchronizes data between the worker PCs and the owner portal.

## Core Features

- **Offline-First Synchronization:** Workers can continue generating Amad (Inward) and Nikasi (Outward) slips even when internet connectivity drops. The built-in sync engine queues transactions locally and pushes them securely when back online.
- **Maker-Checker Workflow:** Workers act as "Makers" generating pending slips. Owners act as "Checkers" who can approve or reject financial transactions from the cloud portal.
- **Multi-Tenancy:** Securely separates data between different warehouse facilities using isolated Tenant IDs at the application layer.
- **Premium UI:** Designed with a stunning, high-contrast dark theme (Meridian UI) featuring glassmorphism, responsive data tables, and ambient background glows.

## Quick Start

### 1. Backend (NestJS)
```bash
cd cold-storage-backend
npm install
npm run dev
```

### 2. Desktop Worker App (Tauri)
```bash
cd cold-storage-desktop
npm install
npm run tauri dev
```

### 3. Owner Web Portal
```bash
cd cold-storage-web
npm install
npm run dev
```
