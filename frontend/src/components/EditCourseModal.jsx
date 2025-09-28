function EditCourseModal({ isOpen, onClose, course, onSave, isSaving, error }) {
  const [title, setTitle] = useState(course.title || "");
  const [category, setCategory] = useState(course.category || "General");
  const [hours, setHours] = useState(course.hours || 0);
  const [dueDate, setDueDate] = useState(
    course.dueDate ? new Date(course.dueDate) : null
  );
  const [description, setDescription] = useState(course.description || "");

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.700"
      zIndex={1000}
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      overflow="auto"
      py={8}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-course-title"
    >
      <Container maxW="lg" onClick={(e) => e.stopPropagation()}>
        <Box
          bg="white"
          p={6}
          rounded="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading id="edit-course-title" size="sm" mb={4}>
            Edit course
          </Heading>

          {error && (
            <Box
              mb={3}
              p={2}
              bg="red.50"
              color="red.700"
              border="1px solid"
              borderColor="red.200"
              rounded="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          <Box mb={3}>
            <Text fontSize="sm" mb={1}>
              Title
            </Text>
            <Box
              as="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          <Box mb={3}>
            <Text fontSize="sm" mb={1}>
              Category
            </Text>
            <Box
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              w="100%"
            >
              <option>General</option>
              <option>Data</option>
              <option>Security</option>
              <option>Compliance</option>
              <option>Sales</option>
              <option>HR</option>
            </Box>
          </Box>

          <Box mb={3}>
            <Text fontSize="sm" mb={1}>
              Duration (hours)
            </Text>
            <Box
              as="input"
              type="number"
              min={0}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          <Box mb={3}>
            <Text fontSize="sm" mb={1}>
              Due date
            </Text>
            <Box
              as="input"
              type="date"
              value={toInputDate(dueDate)}
              onChange={(e) => setDueDate(fromInputDate(e.target.value))}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Description
            </Text>
            <Box
              as="textarea"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          <HStack justify="flex-end" spacing={3}>
            <Button
              variant="outline"
              bg="gray.300"
              _hover={{ bg: "gray.400" }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              color="white"
              onClick={() =>
                onSave({
                  title,
                  category,
                  hours: Number(hours) || 0,
                  dueDate: dueDate ? dueDate.toISOString() : null,
                  description,
                })
              }
              isDisabled={isSaving || !title.trim()}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}

function toInputDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function fromInputDate(v) {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}
