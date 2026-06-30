<?php

namespace App\Dto\TableView;

class TableViewRow
{
    private array $data = [
        '__RESPONSIVE' => '',
    ];

    public function addField(string $fieldName, string|int|float $label, string|int|float|null $value = null, string $class = ''): void
    {
        if (null === $value) {
            $value = $label;
        }
        $this->data[$fieldName] = $label;
        $this->data['__' . $fieldName . '_SORT'] = is_string($value) ? strip_tags($value) : $value;
        $this->data['__' . $fieldName . '_CLASS'] = $class;
    }

    public function addAction(string $url, string $icon, string $label = '', string $confirmAction = '', bool $isConfirmRemove = false, string $class = '')
    {
        if (!array_key_exists('__ACTIONS', $this->data)) {
            $this->data['__ACTIONS'] = [];
        }
        $action = [
            'url' => $url,
            'label' => $label,
            'icon' => $icon,
        ];

        if ('' != $confirmAction) {
            if ($isConfirmRemove) {
                $action['confirm-remove'] = $confirmAction;
            } else {
                $action['confirm'] = $confirmAction;
            }
        }

        if ($url || $icon) {
            $this->data['__ACTIONS'][] = $action;
        }
        $this->data['____ACTIONS_CLASS'] = $class;
    }

    public function setHref(string $url): void
    {
        $this->data['__href'] = $url;
    }

    public function toArray(?array $columnsDef = null): array
    {
        if (null == $columnsDef) {
            return $this->data;
        }

        $data = [];

        foreach ($columnsDef as $columnDef) {
            $fieldName = $columnDef['data']['_'];
            $fieldSort = $columnDef['data']['sort'];
            $fieldClass = $columnDef['data']['class'];

            if (array_key_exists($fieldName, $this->data)) {
                $data[$fieldName] = $this->data[$fieldName];
                $data[$fieldSort] = $this->data[$fieldSort];
                $data[$fieldClass] = $this->data[$fieldClass];
            } else {
                $data[$fieldName] = '';
                $data[$fieldSort] = '';
                $data[$fieldClass] = '';
            }
        }

        if (array_key_exists('__href', $this->data)) {
            $data['__href'] = $this->data['__href'];
        }

        if (array_key_exists('__ACTIONS', $this->data)) {
            $data['__ACTIONS'] = $this->data['__ACTIONS'];
        }
        if (array_key_exists('____ACTIONS_CLASS', $this->data)) {
            $data['____ACTIONS_CLASS'] = $this->data['____ACTIONS_CLASS'];
        }

        return $data;
    }
}
