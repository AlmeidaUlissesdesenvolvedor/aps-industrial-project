namespace IndustrialAPS.API.DTOs
{
    /*
     * Dados recebidos pelo backend para executar
     * um novo planejamento de produção.
     *
     * O frontend enviará apenas:
     *
     * - produto;
     * - quantidade;
     * - data limite opcional.
     */
    public class PlanningRequestDto
    {
        // Produto que será fabricado.
        public int ProductId { get; set; }

        // Quantidade que deverá ser produzida.
        public decimal Quantity { get; set; }

        /*
         * Data desejada para conclusão.
         *
         * É opcional. Caso não seja informada,
         * o backend poderá definir uma data padrão.
         */
        public DateTime? DueDate { get; set; }
    }
}