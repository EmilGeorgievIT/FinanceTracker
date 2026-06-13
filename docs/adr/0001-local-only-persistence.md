# Local-only persistence for v1

Finance Tracker v1 stores all data locally on the device using SQLite — no cloud sync, no backend, no account system.

## Context

We chose local-only because: (a) it eliminates auth, backend infrastructure, and network dependency; (b) the user confirmed they don't need multi-device access; (c) sync doubles development time. Manual JSON export covers backup and device migration.

This is hard to reverse — adding cloud sync later means migrating the data layer and introducing auth. We're betting that if sync becomes needed, the app will have proven its value enough to justify the rework.
