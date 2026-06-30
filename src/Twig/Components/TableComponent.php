<?php

namespace App\Twig\Components;

use App\Dto\TableView\TableView;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Symfony\UX\TwigComponent\Attribute\PostMount;

/**
 * Composant tableau DataTables alimenté soit par un `TableView` (rendu SSR),
 * soit par une URL AJAX (données chargées côté client).
 *
 * Usage SSR — données passées depuis le contrôleur :
 *
 * ```twig
 * <twig:Table :data="TableView" />
 * ```
 *
 * Usage AJAX — données chargées en JavaScript :
 *
 * ```twig
 * <twig:Table
 *     url="{{ path('app_api_list') }}"
 *     title="Liste des alertes"
 *     newUrl="{{ path('app_new') }}"
 *     newTitle="Ajouter une alerte"
 * />
 * ```
 *
 * Usage complet avec toutes les options :
 *
 * ```twig
 * <twig:Table
 *     :data="TableView"
 *     id="table-alertes"
 *     class="table-compact"
 *     url="{{ path('app_api_alertes') }}"
 *     title="Alertes"
 *     newUrl="{{ path('app_alertes_new') }}"
 *     newTitle="Nouvelle alerte"
 *     :header="true"
 *     :footer="false"
 *     :responsive="true"
 * />
 * ```
 *
 * Construire un `TableView` dans le contrôleur :
 *
 * ```php
 * use App\Dto\TableView\TableView;
 *
 * $table = new TableView();
 * $table->addColumn('id',    'ID',    ['orderable' => false, 'visible' => false]);
 * $table->addColumn('name',  'Nom',   ['class' => 'font-semibold']);
 * $table->addColumn('date',  'Date',  ['type' => 'date-fr']);
 * $table->addRow(['id' => 1, 'name' => 'Alerte ANSM', 'date' => '2026-05-19']);
 * $table->setOrder('date', 'desc');
 *
 * return $this->render('…', ['TableView' => $table]);
 * ```
 *
 * Rafraîchir les données depuis l'extérieur :
 *
 * ```twig
 * <button data-action="components--twig--table#refresh"
 *         data-components--twig--table-outlet="#table-alertes">
 *     Rafraîchir
 * </button>
 * ```
 *
 * Props disponibles :
 *
 * @property TableView|null $data Données SSR (exclusif avec `url`)
 * @property string $id Identifiant HTML du tableau
 * @property string $class Classes CSS additionnelles
 * @property string $url URL AJAX pour le chargement des données
 * @property string $title Titre affiché dans le bouton "Copier" DataTables
 * @property string $newUrl URL du bouton "Ajouter" dans la barre DataTables
 * @property string $newTitle Libellé du bouton "Ajouter"
 * @property bool $header Afficher les contrôles en-tête DataTables (défaut : true)
 * @property bool $footer Afficher les contrôles pied de tableau (défaut : true)
 * @property bool $responsive Mode responsive DataTables (défaut : true) — `false` active le scroll horizontal
 *
 * Événements Stimulus émis :
 *   `components--twig--table:load`  — après le chargement initial des données (detail.table = instance Table)
 */
#[AsTwigComponent('Table', template: 'components/table.html.twig')]
class TableComponent
{
    public ?TableView $data = null;
    public string $id = '';
    public string $class = '';
    public bool $header = true;
    public bool $footer = true;
    public bool $responsive = true;
    public string $url = '';
    public string $title = '';
    public string $newUrl = '';
    public string $newTitle = '';

    // ── Données résolues après montage ────────────────────────────────────────

    /** @var array<int,mixed> Ordre initial des colonnes résolu depuis TableView */
    public array $columnOrders = [];

    /** @var mixed[] Colonnes DataTables */
    public array $columns = [];

    /** @var mixed[] Lignes de données */
    public array $rows = [];

    #[PostMount]
    public function postMount(): void
    {
        if (!$this->data instanceof TableView) {
            return;
        }

        $tableData = $this->data->toArray();
        $this->columns = $tableData['columns'] ?? [];
        $this->rows = $tableData['data'] ?? [];
        $this->columnOrders = $this->resolveColumnOrders($tableData);
    }

    /** @param mixed[] $tableData */
    private function resolveColumnOrders(array $tableData): array
    {
        if (!array_key_exists('order', $tableData)) {
            return [];
        }

        $orders = [];
        foreach ($tableData['order'] as $order) {
            foreach ($tableData['columns'] as $keyCol => $columnData) {
                if ($order['name'] === ($columnData['name'] ?? '')) {
                    $orders[] = [$keyCol, $order['dir']];
                }
            }
        }

        return $orders;
    }
}
