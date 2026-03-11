export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
          isOneToOne?: boolean;
        }>;
      }
    >;
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
          isOneToOne?: boolean;
        }>;
      }
    >;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
};
