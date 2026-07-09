"""Unit test suite for single-instance file locking (`InstanceLock`).

Verifies lock acquisition, release, context manager behavior, and collision
handling when multiple instances attempt to acquire the same lockfile.
"""

from pathlib import Path
import pytest

from mirza.engine.lock import InstanceAlreadyRunningError, InstanceLock


def test_instance_lock_acquire_and_release(tmp_path: Path) -> None:
    """Tests clean lock acquisition and release."""
    lock_file = tmp_path / "test_mirza.lock"
    lock = InstanceLock(lock_path=lock_file)

    assert lock.acquire() is True
    assert lock_file.exists()
    assert lock._file_handle is not None

    lock.release()
    assert lock._file_handle is None
    assert not lock_file.exists()


def test_instance_lock_context_manager(tmp_path: Path) -> None:
    """Tests lock lifecycle management within a `with` statement block."""
    lock_file = tmp_path / "ctx_mirza.lock"

    with InstanceLock(lock_path=lock_file) as lock:
        assert lock._file_handle is not None
        assert lock_file.exists()

    assert not lock_file.exists()


def test_instance_lock_collision_raises(tmp_path: Path) -> None:
    """Verifies that acquiring a lock on an already locked file raises InstanceAlreadyRunningError."""
    lock_file = tmp_path / "collision.lock"
    lock1 = InstanceLock(lock_path=lock_file)
    lock2 = InstanceLock(lock_path=lock_file)

    assert lock1.acquire() is True

    with pytest.raises(InstanceAlreadyRunningError) as exc_info:
        lock2.acquire()

    assert "Active instance detected" in str(exc_info.value) or "Cannot access lockfile" in str(exc_info.value)

    lock1.release()
