using IndustrialAPS.Domain.Algorithms.Tree;
using IndustrialAPS.Domain.Entities;

namespace IndustrialAPS.Domain.Services
{
    public class BOMService
    {
        public BOMTree BuildBOMTree(
            Product product,
            List<BOMItem> allBomItems,
            List<Material> allMaterials
        )
        {
            var root = new BOMTreeNode(
                product.Id,
                product.Name,
                1
            );

            var materialsById = allMaterials
                .ToDictionary(m => m.Id);

            BuildChildren(
                root,
                product.Id,
                allBomItems,
                materialsById
            );

            return new BOMTree(root);
        }

        private void BuildChildren(
            BOMTreeNode parentNode,
            int productId,
            List<BOMItem> allBomItems,
            Dictionary<int, Material> materialsById
        )
        {
            var bomItems = allBomItems
                .Where(b => b.ProductId == productId)
                .ToList();

            foreach (var item in bomItems)
            {
                if (
                    materialsById.TryGetValue(
                        item.ComponentId,
                        out var material
                    )
                )
                {
                    var childNode = new BOMTreeNode(
                        material.Id,
                        material.Name,
                        item.Quantity
                    );

                    parentNode.AddChild(childNode);
                }
            }
        }

        public Dictionary<string, decimal>
            CalculateMaterialRequirements(
                BOMTree tree,
                decimal productionQuantity
            )
        {
            if (productionQuantity <= 0)
            {
                throw new ArgumentException(
                    "A quantidade de produção deve ser maior que zero.",
                    nameof(productionQuantity)
                );
            }

            return tree.CalculateMaterialRequirements(
                productionQuantity
            );
        }
    }
}