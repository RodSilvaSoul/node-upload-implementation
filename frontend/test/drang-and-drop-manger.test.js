import { expect, jest, describe, test } from '@jest/globals';
import { DragAndDropManager } from '../public/src/drag-and-drop-manager.js';

describe('#DragAndDropManger test suite', () => {
  describe('#disableDragAnDropEvents', () => {
    test('it should disable the defaults drag and drop events', () => {
      jest.spyOn(
        global.document.body,
        global.document.body.addEventListener.name,
      );

      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({
          addEventListener: jest.fn(),
        }));

      const dragAndDropManger = new DragAndDropManager();

      dragAndDropManger.disableDragAnDropEvents();

      const expectedCalls = [
        ['dragenter', expect.any(Function), false],
        ['dragover', expect.any(Function), false],
        ['dragleave', expect.any(Function), false],
        ['drop', expect.any(Function), false],
      ];

      const dropAreaAddEventCalls =
        dragAndDropManger.dropArea.addEventListener.mock.calls;

      const bodyAddEventCalls = document.body.addEventListener.mock.calls;

      expect(dropAreaAddEventCalls).toEqual(expectedCalls);
      expect(bodyAddEventCalls).toEqual(expectedCalls);

      const mockedEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      [dropAreaAddEventCalls, bodyAddEventCalls].forEach((calls) => {
        calls.forEach((call) => call[1](mockedEvent));
      });

      expect(mockedEvent.preventDefault).toHaveBeenCalledTimes(8);
      expect(mockedEvent.stopPropagation).toHaveBeenCalledTimes(8);
    });
  });

  describe('#enableHighLightOnDrag', () => {
    test('it should enable events tho highlight the drop area', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({
          addEventListener: jest.fn(),
          classList: {
            add: jest.fn(),
          },
        }));

      const dragAndDropManger = new DragAndDropManager();

      dragAndDropManger.enableHighLightOnDrag();
      const expectedCalls = [
        ['dragenter', expect.any(Function), false],
        ['dragover', expect.any(Function), false],
      ];

      const addEventCalls =
        dragAndDropManger.dropArea.addEventListener.mock.calls;

      expect(addEventCalls).toEqual(expectedCalls);

      expectedCalls.forEach((call) => call[1]());

      const expectedClassAddCalls = [
        'highlight',
        'drop-area',
        'highlight',
        'drop-area',
      ];

      expect(
        dragAndDropManger.dropArea.classList.add.mock.calls.join(),
      ).toEqual(expectedClassAddCalls.join());
    });
  });

  describe('#enableDrop', () => {
    test('it should collet the dropped files by the user and remove the highligh area effect', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({
          addEventListener: jest.fn(),
          classList: {
            remove: jest.fn(),
          },
        }));

      const dragAndDropManger = new DragAndDropManager();

      dragAndDropManger.onDropHandler = jest.fn();

      dragAndDropManger.enableDrop();
      const expectedCalls = [['drop', expect.any(Function), false]];

      const addEventCalls =
        dragAndDropManger.dropArea.addEventListener.mock.calls;

      expect(addEventCalls).toEqual(expectedCalls);

      const mockedEvent = {
        dataTransfer: {
          files: [],
        },
      };

      addEventCalls[0][1](mockedEvent);

      expect(dragAndDropManger.dropArea.classList.remove).toHaveBeenCalledWith(
        'drop-area',
      );

      expect(dragAndDropManger.onDropHandler).toHaveBeenCalledWith([]);
    });
  });

  describe('#init', () => {
    test('it should initialize all the configured functions and set the onDropHandler property', () => {
      const dragAndDropManger = new DragAndDropManager();

      jest
        .spyOn(
          dragAndDropManger,
          dragAndDropManger.disableDragAnDropEvents.name,
        )
        .mockImplementation();
      jest
        .spyOn(dragAndDropManger, dragAndDropManger.enableDrop.name)
        .mockImplementation();
      jest
        .spyOn(dragAndDropManger, dragAndDropManger.enableHighLightOnDrag.name)
        .mockImplementation();

      const onDropHandlerFn = jest.fn();

      dragAndDropManger.init({
        onDropHandler: onDropHandlerFn,
      });

      const {
        disableDragAnDropEvents,
        enableHighLightOnDrag,
        enableDrop,
        onDropHandler,
      } = dragAndDropManger;

      expect(disableDragAnDropEvents).toHaveBeenCalled();
      expect(enableHighLightOnDrag).toHaveBeenCalled();
      expect(enableDrop).toHaveBeenCalled();
      expect(onDropHandler).toBe(onDropHandlerFn);
    });
  });
});
