<?php
session_start();
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$dataDir = __DIR__ . '/data/';

function readJson($file) {
    return json_decode(file_get_contents($file), true);
}

function writeJson($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

switch ($action) {
    case 'login':
        $studentId = $_POST['studentId'] ?? '';
        $users = readJson($GLOBALS['dataDir'] . 'users.json');
        foreach ($users['students'] as $student) {
            if ($student['id'] === $studentId) {
                $_SESSION['student'] = $student;
                echo json_encode(['success' => true]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Invalid ID']);
        break;

    case 'get_user':
        if (isset($_SESSION['student'])) {
            echo json_encode(['loggedIn' => true, 'student' => $_SESSION['student']]);
        } else {
            echo json_encode(['loggedIn' => false]);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    case 'get_students':
        $users = readJson($GLOBALS['dataDir'] . 'users.json');
        echo json_encode($users['students']);
        break;

    case 'add_activity':
        $title = $_POST['title'] ?? '';
        $desc = $_POST['description'] ?? '';
        $activities = readJson($GLOBALS['dataDir'] . 'activities.json');
        $activities[] = ['title' => $title, 'description' => $desc];
        writeJson($GLOBALS['dataDir'] . 'activities.json', $activities);
        echo json_encode(['success' => true]);
        break;

    case 'get_activities':
        $activities = readJson($GLOBALS['dataDir'] . 'activities.json');
        echo json_encode($activities);
        break;

    case 'pair_chat':
        $s1 = $_POST['student1'] ?? '';
        $s2 = $_POST['student2'] ?? '';
        $pairs = readJson($GLOBALS['dataDir'] . 'pairs.json');
        $pairs[] = [$s1, $s2];
        writeJson($GLOBALS['dataDir'] . 'pairs.json', $pairs);
        echo json_encode(['success' => true]);
        break;

    case 'start_game':
        $groupNames = $_POST['groups'] ?? [];
        $groups = ['groups' => []];
        foreach ($groupNames as $name) {
            $groups['groups'][] = ['name' => $name, 'members' => []];
        }
        writeJson($GLOBALS['dataDir'] . 'groups.json', $groups);
        echo json_encode(['success' => true]);
        break;

    case 'get_groups':
        $groups = readJson($GLOBALS['dataDir'] . 'groups.json');
        echo json_encode($groups['groups']);
        break;

    case 'join_group':
        if (!isset($_SESSION['student'])) {
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            break;
        }
        $groupName = $_POST['group'] ?? '';
        $groups = readJson($GLOBALS['dataDir'] . 'groups.json');
        foreach ($groups['groups'] as &$group) {
            if ($group['name'] === $groupName && !in_array($_SESSION['student']['id'], $group['members'])) {
                $group['members'][] = $_SESSION['student']['id'];
            }
        }
        writeJson($GLOBALS['dataDir'] . 'groups.json', $groups);
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>
