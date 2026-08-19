import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import UnitTable from "../../components/unit/UnitTable";
import UnitForm from "../../components/unit/UnitForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../services/unit.service";

const UnitList = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [deleteUnitData, setDeleteUnitData] = useState(null);

  const fetchUnits = async () => {
    try {
      const response = await getUnits(page, 10, search);
      setUnits(response.units ?? []);
      setPagination(response.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load units.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadUnits = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUnits(page, 10, search);

        if (!ignore) {
          setUnits(response.units ?? []);
          setPagination(response.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load units.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadUnits();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createUnit(data);
      setOpenCreate(false);
      await fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create unit.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateUnit(selectedUnit.id, data);
      setOpenEdit(false);
      setSelectedUnit(null);
      await fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update unit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (unit) => {
    setDeleteUnitData(unit);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteUnit(deleteUnitData.id);
      setOpenDelete(false);
      setDeleteUnitData(null);
      await fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete unit.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-masterdata wc-loading-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-6 text-[var(--danger)] shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="wc-page world-module world-masterdata space-y-6 page-container">
        <PageHeader
          badge="Master data"
          title="Units"
          description="Manage unit records and measurement details for inventory items."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => setOpenCreate(true)}>Add Unit</Button>
            </div>
          }
        />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search units..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{units.length} units</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          {units.length === 0 ? (
            <EmptyState
              title="No units yet"
              description="Add measurement units to keep product data consistent."
              action={<Button onClick={() => setOpenCreate(true)}>Add Unit</Button>}
            />
          ) : (
            <UnitTable units={units} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Unit">
        <UnitForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedUnit(null);
        }}
        title="Edit Unit"
      >
        <UnitForm
          key={selectedUnit?.id || "edit"}
          initialData={selectedUnit || { id: null, name: "", symbol: "" }}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteUnitData(null);
        }}
        title="Delete Unit"
      >
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteUnitData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteUnitData(null); }}>
              Cancel
            </Button>

            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UnitList;
