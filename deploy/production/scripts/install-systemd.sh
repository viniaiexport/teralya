#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ejecutar con sudo." >&2
  exit 1
fi

root="${TERALYA_ROOT:-/srv/teralya}"
install -m 0644 "$root/systemd/teralya-backup.service" /etc/systemd/system/teralya-backup.service
install -m 0644 "$root/systemd/teralya-backup.timer" /etc/systemd/system/teralya-backup.timer
install -m 0644 "$root/systemd/teralya-backup-verify.service" /etc/systemd/system/teralya-backup-verify.service
install -m 0644 "$root/systemd/teralya-backup-verify.timer" /etc/systemd/system/teralya-backup-verify.timer
systemctl daemon-reload
systemctl enable --now teralya-backup.timer teralya-backup-verify.timer
systemctl list-timers 'teralya-backup*' --no-pager
