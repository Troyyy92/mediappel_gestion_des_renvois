"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { History, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

const ForwardingHistoryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    setIsLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, count, error } = await supabase
        .from("forwarding_history")
        .select(`
          *,
          profiles:user_id (first_name, last_name)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setHistory(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, page]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getUserDisplayName = (item: any) => {
    if (!item.profiles) return "Utilisateur";
    const name = `${item.profiles.first_name || ""} ${item.profiles.last_name || ""}`.trim();
    return name || "Utilisateur";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <History className="w-4 h-4" />
          <span>Historique des renvois</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-8">
            <span>Historique des Renvois</span>
            <Button size="sm" variant="ghost" onClick={fetchHistory} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun historique disponible.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs">
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {getUserDisplayName(item)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.line_number}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.destination_number === "voicemail" || !item.destination_number ? "Répondeur" : item.destination_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.action_type === "activation" ? "default" : "destructive"} className="text-[10px] uppercase">
                        {item.action_type === "activation" ? "Activation" : "Désactivation"}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Type: {item.forwarding_type}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            Total : {totalCount} entrées
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {page + 1} sur {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardingHistoryModal;