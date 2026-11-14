namespace IndustrialAPS.API.DTOs
{
    /*
     * DTO utilizado para cadastrar ou atualizar
     * uma conexão entre duas máquinas.
     *
     * Não recebemos os objetos completos Machine,
     * apenas os IDs necessários para criar a relação.
     */
    public class MachineConnectionDto
    {
        // Máquina onde a conexão começa.
        public int FromMachineId { get; set; }

        // Máquina para onde a conexão aponta.
        public int ToMachineId { get; set; }

        /*
         * Peso da aresta do grafo.
         *
         * Pode representar distância, tempo ou custo.
         * Posteriormente será utilizado pelo Dijkstra.
         */
        public decimal Weight { get; set; }
    }
}