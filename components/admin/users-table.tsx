"use client";

import { DataTable } from "@/components/admin/data-table";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null;
  role: string;
  createdAt: Date | string;
}

interface UsersTableProps {
  users: Profile[];
}

export function UsersTable({ users }: UsersTableProps) {
  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (value: string | null) => value || "-",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Telefone",
      render: (value: string | null) => {
        if (!value) return "-";
        // Formatar telefone: (XX) XXXXX-XXXX
        return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      },
    },
    {
      key: "cpf",
      label: "CPF",
      render: (value: string | null) => {
        if (!value) return "-";
        // Formatar CPF: XXX.XXX.XXX-XX
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      },
    },
    {
      key: "role",
      label: "Tipo",
      render: (value: string) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            value === "ADMIN"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value === "ADMIN" ? "Administrador" : "Cliente"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data de Cadastro",
      render: (value: Date | string) =>
        new Date(value).toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  return <DataTable columns={columns} data={users} />;
}
