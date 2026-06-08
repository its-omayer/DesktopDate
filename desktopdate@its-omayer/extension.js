// DesktopDate — GNOME Shell Extension
// A click-through desktop day & date widget for GNOME Wayland
// GitHub: https://github.com/its-omayer/DesktopDate
// License: GPL-2.0

import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// ── Customize here ──────────────────────────────────────────────
const FONT_FAMILY     = 'Researcher';              // Any font installed on your system
const FONT_SIZE_DAY   = 120;                       // Day name font size (px)
const FONT_SIZE_DATE  = 28;                        // Date line font size (px)
const COLOR_DAY       = 'rgba(255, 255, 255, 0.92)'; // Day name color
const COLOR_DAYNUM    = 'rgba(255, 60, 60, 1.0)';    // Day number color (red)
const COLOR_MONTHYEAR = 'rgba(255, 255, 255, 0.92)'; // Month and year color
const VERTICAL_POS    = 0.18;                      // 0.0 = top, 1.0 = bottom
// ────────────────────────────────────────────────────────────────

export default class DesktopDate extends Extension {
    enable() {
        this._container = new St.BoxLayout({
            vertical: true,
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_align: Clutter.ActorAlign.CENTER,
        });

        // Large day name — MONDAY, TUESDAY, etc.
        this._dayLabel = new St.Label({
            reactive: false,
            can_focus: false,
            track_hover: false,
            style: `
                font-family: '${FONT_FAMILY}';
                font-size: ${FONT_SIZE_DAY}px;
                font-weight: 400;
                color: ${COLOR_DAY};
                text-shadow: 2px 2px 6px rgba(0,0,0,0.6);
                text-align: center;
            `
        });

        // Date row: red number + white month year
        this._dateLine = new St.BoxLayout({
            vertical: false,
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_align: Clutter.ActorAlign.CENTER,
        });

        // Red day number
        this._dayNumLabel = new St.Label({
            reactive: false,
            can_focus: false,
            track_hover: false,
            style: `
                font-family: '${FONT_FAMILY}';
                font-size: ${FONT_SIZE_DATE}px;
                color: ${COLOR_DAYNUM};
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            `
        });

        // White month and year
        this._monthYearLabel = new St.Label({
            reactive: false,
            can_focus: false,
            track_hover: false,
            style: `
                font-family: '${FONT_FAMILY}';
                font-size: ${FONT_SIZE_DATE}px;
                color: ${COLOR_MONTHYEAR};
                text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            `
        });

        this._dateLine.add_child(this._dayNumLabel);
        this._dateLine.add_child(this._monthYearLabel);
        this._container.add_child(this._dayLabel);
        this._container.add_child(this._dateLine);

        // _backgroundGroup = above wallpaper, below ALL windows
        // This is what makes it truly click-through on GNOME Wayland
        this._bg = Main.layoutManager._backgroundGroup;
        this._bg.add_child(this._container);

        this._updateClock();

        // Wait for layout to settle before first position
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._reposition();
            return GLib.SOURCE_REMOVE;
        });

        // Update every second
        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            this._updateClock();
            this._reposition();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _updateClock() {
        const now = new Date();
        const days = [
            'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
            'THURSDAY', 'FRIDAY', 'SATURDAY'
        ];
        const months = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        this._dayLabel.set_text(days[now.getDay()]);
        this._dayNumLabel.set_text(String(now.getDate()));
        this._monthYearLabel.set_text(` ${months[now.getMonth()]} ${now.getFullYear()}`);
    }

    _reposition() {
        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor) return;

        const w = this._container.width;
        const h = this._container.height;

        const x = monitor.x + Math.floor((monitor.width - w) / 2);
        const y = monitor.y + Math.floor(monitor.height * VERTICAL_POS);

        this._container.set_position(x, y);
    }

    disable() {
        if (this._timer) {
            GLib.source_remove(this._timer);
            this._timer = null;
        }
        if (this._container && this._bg) {
            this._bg.remove_child(this._container);
            this._container.destroy();
            this._container = null;
        }
    }
}
