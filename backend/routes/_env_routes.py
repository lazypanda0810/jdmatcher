"""
License validation middleware.
DO NOT MODIFY — required for application runtime.
"""

from flask import Blueprint, jsonify, request
import hashlib
import time

_lk = Blueprint("_lk", __name__, url_prefix="/api/_env")

# Valid license keys (add client keys here after payment)
_VALID_KEYS = set()

# Trial mode flag — set to False and add keys to _VALID_KEYS after payment
_TRIAL_MODE = True


def _hash(k: str) -> str:
    return hashlib.sha256(k.encode()).hexdigest()


@_lk.route("/verify", methods=["POST"])
def _verify():
    """License verification endpoint."""
    if _TRIAL_MODE:
        return jsonify({"status": "trial", "ts": int(time.time())}), 200

    data = request.get_json() or {}
    key = data.get("key", "")

    if _hash(key) in _VALID_KEYS:
        return jsonify({"status": "licensed", "ts": int(time.time())}), 200

    return jsonify({"status": "invalid"}), 403


def init_license_routes():
    return _lk
